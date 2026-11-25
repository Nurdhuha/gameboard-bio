import fs from 'fs';
import path from 'path';

/**
 * Pengumpul metrik latensi, RPS, dan distribusi status HTTP per endpoint.
 */
export class MetricsCollector {
  constructor() {
    this.startedAt = Date.now();
    this.byEndpoint = new Map();
    this.totalRequests = 0;
    this.totalSuccess = 0;
    this.totalErrors = 0;
    this.stageSnapshots = [];
  }

  record(endpoint, status, durationMs, errorMessage = null) {
    this.totalRequests++;
    const isOk = status >= 200 && status < 400;
    if (isOk) {
      this.totalSuccess++;
    } else {
      this.totalErrors++;
    }

    if (!this.byEndpoint.has(endpoint)) {
      this.byEndpoint.set(endpoint, {
        endpoint,
        count: 0,
        success: 0,
        errors: 0,
        durations: [],
        statuses: {},
        sampleErrors: [],
      });
    }

    const entry = this.byEndpoint.get(endpoint);
    entry.count++;
    if (isOk) entry.success++;
    else entry.errors++;

    entry.durations.push(durationMs);
    const statusKey = String(status || 'ERR');
    entry.statuses[statusKey] = (entry.statuses[statusKey] || 0) + 1;

    if (!isOk && errorMessage && entry.sampleErrors.length < 5) {
      entry.sampleErrors.push(`[${statusKey}] ${errorMessage}`);
    }
  }

  snapshotStage(label, activeStudents, activeTeachers, windowDurationSec) {
    const allDurations = [];
    let count = 0;
    let errors = 0;
    for (const entry of this.byEndpoint.values()) {
      count += entry.count;
      errors += entry.errors;
      allDurations.push(...entry.durations);
    }
    const stats = computePercentiles(allDurations);
    const prevCount = this.stageSnapshots.reduce((sum, s) => sum + s.stageRequests, 0);
    const prevErrors = this.stageSnapshots.reduce((sum, s) => sum + s.stageErrors, 0);
    const stageRequests = count - prevCount;
    const stageErrors = errors - prevErrors;
    const errorRate = stageRequests > 0 ? stageErrors / stageRequests : 0;

    const snap = {
      label,
      activeStudents,
      activeTeachers,
      windowDurationSec,
      stageRequests,
      stageErrors,
      rps: Number((stageRequests / Math.max(windowDurationSec, 1)).toFixed(2)),
      errorRate: Number((errorRate * 100).toFixed(2)),
      p95Ms: stats.p95,
      p99Ms: stats.p99,
      avgMs: stats.avg,
    };
    this.stageSnapshots.push(snap);
    return snap;
  }

  summarize() {
    const elapsedSec = Math.max((Date.now() - this.startedAt) / 1000, 0.1);
    const allDurations = [];
    const endpoints = [];

    for (const entry of this.byEndpoint.values()) {
      allDurations.push(...entry.durations);
      const p = computePercentiles(entry.durations);
      endpoints.push({
        endpoint: entry.endpoint,
        count: entry.count,
        success: entry.success,
        errors: entry.errors,
        errorRatePct: Number(((entry.errors / Math.max(entry.count, 1)) * 100).toFixed(2)),
        rps: Number((entry.count / elapsedSec).toFixed(2)),
        ...p,
        statuses: entry.statuses,
        sampleErrors: entry.sampleErrors,
      });
    }

    endpoints.sort((a, b) => b.count - a.count);
    const overall = computePercentiles(allDurations);

    return {
      elapsedSec: Number(elapsedSec.toFixed(2)),
      totalRequests: this.totalRequests,
      totalSuccess: this.totalSuccess,
      totalErrors: this.totalErrors,
      overallErrorRatePct: Number(((this.totalErrors / Math.max(this.totalRequests, 1)) * 100).toFixed(2)),
      overallRps: Number((this.totalRequests / elapsedSec).toFixed(2)),
      overallLatency: overall,
      stages: this.stageSnapshots,
      endpoints,
    };
  }
}

function computePercentiles(arr) {
  if (!arr || arr.length === 0) {
    return { min: 0, avg: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const pick = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))];

  return {
    min: Number(sorted[0].toFixed(1)),
    avg: Number((sum / sorted.length).toFixed(1)),
    p50: Number(pick(0.5).toFixed(1)),
    p95: Number(pick(0.95).toFixed(1)),
    p99: Number(pick(0.99).toFixed(1)),
    max: Number(sorted[sorted.length - 1].toFixed(1)),
  };
}

export function saveReport(targetUrl, profileName, summary, cleanupResults) {
  const reportsDir = path.resolve(process.cwd(), 'tests/load-test/reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonPath = path.join(reportsDir, `load-test-${profileName}-${stamp}.json`);
  const mdPath = path.join(reportsDir, `load-test-${profileName}-${stamp}.md`);

  const payload = {
    timestamp: new Date().toISOString(),
    targetUrl,
    profile: profileName,
    summary,
    cleanupResults,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');

  const lines = [
    `# Laporan Load Test Ecoplay (${profileName})`,
    '',
    `- **Target URL**: \`${targetUrl}\``,
    `- **Waktu**: ${payload.timestamp}`,
    `- **Durasi Total**: ${summary.elapsedSec} detik`,
    `- **Total Request**: ${summary.totalRequests} (${summary.overallRps} req/detik)`,
    `- **Sukses / Gagal**: ${summary.totalSuccess} / ${summary.totalErrors} (**Error Rate: ${summary.overallErrorRatePct}%**)`,
    `- **Latensi Global (ms)**: Avg=${summary.overallLatency.avg} | P50=${summary.overallLatency.p50} | P95=${summary.overallLatency.p95} | P99=${summary.overallLatency.p99} | Max=${summary.overallLatency.max}`,
    '',
    '## Ringkasan Per Tahap Beban',
    '',
    '| Tahap | Siswa | Guru | Req | RPS | Error % | Avg (ms) | P95 (ms) | P99 (ms) |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...summary.stages.map(
      (s) =>
        `| ${s.label} | ${s.activeStudents} | ${s.activeTeachers} | ${s.stageRequests} | ${s.rps} | ${s.errorRate}% | ${s.avgMs} | ${s.p95Ms} | ${s.p99Ms} |`
    ),
    '',
    '## Rincian Per Endpoint',
    '',
    '| Endpoint | Count | RPS | Error % | Avg (ms) | P95 (ms) | P99 (ms) | Status Codes |',
    '|---|---:|---:|---:|---:|---:|---:|---|',
    ...summary.endpoints.map(
      (e) =>
        `| \`${e.endpoint}\` | ${e.count} | ${e.rps} | ${e.errorRatePct}% | ${e.avg} | ${e.p95} | ${e.p99} | \`${JSON.stringify(e.statuses)}\` |`
    ),
  ];

  const failedEndpoints = summary.endpoints.filter((e) => e.sampleErrors.length > 0);
  if (failedEndpoints.length > 0) {
    lines.push('', '## Sampel Error', '');
    for (const fe of failedEndpoints) {
      lines.push(`- **${fe.endpoint}**: ${fe.sampleErrors.join(' ; ')}`);
    }
  }

  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
  return { jsonPath, mdPath };
}
