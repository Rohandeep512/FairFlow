
export const SERVICE_RATES = {
  print:      0.25,  // 1 page ≈ 15 seconds
  equipment:  1.0,   // 1 unit = 1 minute (already in minutes)
  healthcare: 1.0,   // 1 unit = 1 minute
  support:    3.0,   // complexity 5 ≈ 15 mins
  food:       4.0,   // 1 item ≈ 4 minutes prep
  general:    1.0,   // default 1:1
};
export const getRate = (serviceType) => SERVICE_RATES[serviceType] ?? 1.0;
