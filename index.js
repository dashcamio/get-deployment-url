import { getInput, setOutput, setFailed } from "@actions/core";
import { getOctokit } from "@actions/github";
import { get } from "lodash-es";
import fetch from "node-fetch"; // Make sure to install this package or use another method to perform HTTP requests
import query from "./query.gql";

async function getDeployment(args, retryInterval, searchString) {
  let deploymentUrl = null;
  while (!deploymentUrl) {
    deploymentUrl = await tryGetResult(args, searchString);
    if (!deploymentUrl) {
      console.log(
        `No deployment matching the search string found, waiting ${retryInterval} milliseconds and trying again`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }
  return deploymentUrl;
}

async function tryGetResult(args, searchString) {
  const octokit = getOctokit(getInput("token", { required: true }));
  const result = await octokit.graphql(query, args);

  await waitForRateLimitReset(result);

  const edges = get(result, "repository.ref.target.deployments.edges");
  if (!edges || edges.length === 0) return null;

  const urls = edges.map(edge => get(edge, 'node.latestStatus.environmentUrl', null)).filter(url => url !== null);

  // Check each URL for the searchString and return the first match
  for (const url of urls) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      if (text.includes(searchString)) {
        return url; // Return the first matching URL
      }
    } catch (error) {
      console.error(`Failed to fetch from ${url}: ${error}`);
    }
  }
  return null; // Return null if no matching URL is found
}

async function waitForRateLimitReset(result) {
  const { cost, remaining, resetAt } = result.rateLimit;
  if (remaining >= cost) return;

  const timeToRateLimitReset =
    new Date(resetAt).getTime() - new Date().getTime();
  await new Promise((resolve) => setTimeout(resolve, timeToRateLimitReset));
}

async function run() {
  try {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const branch =
      process.env.GITHUB_HEAD_REF ||
      process.env.GITHUB_REF.match(/(?<=refs\/heads\/).+/g)[0];
    const retryInterval = Number(getInput("retryInterval"));
    const searchString = getInput("searchString", { required: true });

    const args = { repo, owner, branch };
    console.log("Starting to run with following input:", args);

    const deploymentUrl = await getDeployment(args, retryInterval, searchString);

    console.log(deploymentUrl)
    
    setOutput("deploymentUrl", deploymentUrl);
    console.log("Deployment URL set: ", deploymentUrl);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
