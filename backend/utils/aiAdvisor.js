import OpenAI from "openai";
import dotenv from "dotenv";
import { getRate } from './serviceRates.js';
dotenv.config();
const getClient = () => new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
export const getAlgorithmRecommendation = async (serviceType, jobSizes) => {
  console.log("KEY CHECK:", process.env.OPENROUTER_API_KEY ? "Key is loaded!" : "KEY IS MISSING/UNDEFINED!");
  try {
    const client = getClient();
    console.log("=== SENDING TO OPENROUTER (RECOMMENDATION)... ===");
    const avg = jobSizes.length ? (jobSizes.reduce((a, b) => a + b, 0) / jobSizes.length).toFixed(1) : 0;
    const prompt = `You are a scheduling advisor. Service type: "${serviceType}". Current queue has ${jobSizes.length} jobs with average size ${avg} units. Recommend the best scheduling algorithm from: FCFS, SJF, Round Robin, Priority+Aging. Return ONLY pure JSON: { "algorithm": "sjf", "reason": "one sentence explanation" }`;
    const response = await client.chat.completions.create({
      model: "openrouter/free", // This auto-routes to an available free model, preventing 404s!
      messages: [{ role: "user", content: prompt }],
    });
    let text = response.choices[0].message.content;
    console.log("=== RAW AI RESPONSE ===\n", text);
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      const cleanJsonString = text.substring(startIndex, endIndex + 1);
      return JSON.parse(cleanJsonString);
    } else {
      throw new Error("AI did not return valid JSON brackets.");
    }
  } catch (error) {
    console.log("=== ERROR CAUGHT IN RECOMMENDATION! ===");
    console.error("THE EXACT ERROR IS:", error.message || error);
    return { 
      algorithm: "FCFS", 
      reason: "Defaulting to First-Come-First-Serve due to AI service unavailability." 
    };
  }
};
export const predictCompletion = async (jobs, algorithm) => {
  try {
    const client = getClient();
    console.log("=== SENDING TO OPENROUTER (PREDICTION)... ===");
    const summary = jobs.filter(j => j.status === 'waiting').map(j => ({ size: j.job_size }));
    if (summary.length === 0) {
      console.log("=== QUEUE EMPTY: SKIPPING AI CALL ===");
      return { 
        estimatedMinutes: 0, 
        message: "No waiting jobs in the queue to estimate." 
      };
    }
    const prompt = `Scheduling algorithm: ${algorithm}. Remaining jobs: ${JSON.stringify(summary)}. Estimate total time to complete all jobs in minutes. You MUST return ONLY pure JSON and nothing else. Do not add conversational text. Format exactly like this: { "estimatedMinutes": 25, "message": "one sentence explanation" }`;
    const response = await client.chat.completions.create({
      model: "openrouter/free", 
      messages: [{ role: "user", content: prompt }],
    });
    let text = response.choices[0].message.content;
    console.log("=== RAW PREDICTION RESPONSE ===\n", text); 
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      const cleanJsonString = text.substring(startIndex, endIndex + 1);
      return JSON.parse(cleanJsonString);
    } else {
      throw new Error("AI did not return valid JSON brackets.");
    }
  } catch (error) {
    console.log("=== ERROR CAUGHT IN PREDICTION! ===");
    console.error("THE EXACT ERROR IS:", error.message || error);
    const waitingJobs = jobs.filter(j => j.status === 'waiting');
    const totalSize = waitingJobs.reduce((sum, j) => sum + Number(j.job_size), 0);
    const fallbackMins = Math.round(totalSize * 1.0); // Use general rate as safe default
    return { 
      estimatedMinutes: Math.max(0, Math.min(fallbackMins, 480)), 
      message: "Estimated based on average queue metrics due to AI service unavailability." 
    };
  }
};

export const getGeneralRecommendation = async (description) => {
  try {
    const client = getClient();
    console.log("=== SENDING TO OPENROUTER (GENERAL RECOMMENDATION)... ===");
    const prompt = `You are a scheduling advisor. The user operates the following service: "${description}". Recommend the best scheduling algorithm from these keys: "fcfs", "sjf", "rr", "priority". Return ONLY pure JSON: { "algorithm": "fcfs", "reason": "one sentence explanation" }`;
    const response = await client.chat.completions.create({
      model: "openrouter/free",
      messages: [{ role: "user", content: prompt }],
    });
    let text = response.choices[0].message.content;
    console.log("=== RAW AI RESPONSE ===\n", text);
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      const cleanJsonString = text.substring(startIndex, endIndex + 1);
      return JSON.parse(cleanJsonString);
    } else {
      throw new Error("AI did not return valid JSON brackets.");
    }
  } catch (error) {
    console.log("=== ERROR CAUGHT IN GENERAL RECOMMENDATION! ===");
    console.error("THE EXACT ERROR IS:", error.message || error);
    return { 
      algorithm: "fcfs", 
      reason: "Defaulting to First-Come-First-Serve due to AI service unavailability." 
    };
  }
};