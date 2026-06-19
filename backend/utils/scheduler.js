import { getRate } from './serviceRates.js';

export const computeQueue = (jobs, algorithm, agingEnabled) => {
  const waiting = jobs.filter(j => j.status === 'waiting' || j.status === 'processing');
  if (!waiting.length) return [];

  const now = Date.now();

  const withAging = (job) => {
    if (!agingEnabled) return job.job_size;
    const waitMins = (now - new Date(job.arrival_time).getTime()) / 60000;
    return Math.max(0, Number(job.job_size) - waitMins * 0.5);
  };

  switch (algorithm) {
    case 'fcfs':
      return [...waiting].sort((a, b) => new Date(a.arrival_time) - new Date(b.arrival_time));

    case 'sjf':
      return [...waiting].sort((a, b) => withAging(a) - withAging(b));

    case 'rr':
      return [...waiting].sort((a, b) => new Date(a.arrival_time) - new Date(b.arrival_time));

    case 'priority':
      return [...waiting].sort((a, b) => {
        const scoreA = (a.emergency_approved ? 1000 : 0) + (agingEnabled ? (now - new Date(a.arrival_time).getTime()) / 60000 : 0);
        const scoreB = (b.emergency_approved ? 1000 : 0) + (agingEnabled ? (now - new Date(b.arrival_time).getTime()) / 60000 : 0);
        return scoreB - scoreA;
      });

    default:
      return waiting;
  }
};

export const computeMetrics = (jobs) => {
  const completed = jobs.filter(j => j.status === 'completed');
  if (!completed.length) return { avgWaitTime: 0, avgTurnaround: 0, throughput: 0, fairnessScore: 0 };

  const waitTimes = completed.map(j => (new Date(j.start_time) - new Date(j.arrival_time)) / 60000);
  const turnarounds = completed.map(j => (new Date(j.completion_time) - new Date(j.arrival_time)) / 60000);

  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const avgWait = avg(waitTimes);
  const stddev = Math.sqrt(avg(waitTimes.map(w => Math.pow(w - avgWait, 2))));
  const fairness = avgWait > 0 ? Math.max(0, 1 - stddev / avgWait) : 1;

  const sessionMins = (new Date(completed[completed.length - 1].completion_time) - new Date(completed[0].arrival_time)) / 60000;

  return {
    avgWaitTime: avg(waitTimes).toFixed(2),
    avgTurnaround: avg(turnarounds).toFixed(2),
    throughput: sessionMins > 0 ? (completed.length / (sessionMins / 60)).toFixed(2) : 0,
    fairnessScore: (fairness * 100).toFixed(1)
  };
};

export const estimateWaitTime = (jobs, algorithm, agingEnabled, customerId, serviceType = 'general') => {
  const ordered = computeQueue(jobs, algorithm, agingEnabled);
  const pos = ordered.findIndex(j => j.customer_id === customerId);
  if (pos === -1) return null;
  const ahead = ordered.slice(0, pos);
  const totalSize = ahead.reduce((sum, j) => sum + Number(j.job_size), 0);
  const rate = getRate(serviceType);
  const estimatedMins = Math.max(0, Math.min(Math.round(totalSize * rate), 480));
  const lower = Math.max(1, Math.round(estimatedMins * 0.85));
  const upper = Math.round(estimatedMins * 1.15) + 1;
  return { position: pos + 1, estimatedMins, range: estimatedMins === 0 ? 'You\'re next!' : `~${lower}–${upper} mins` };
};