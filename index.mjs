import child_process from "child_process";
import fs from "fs/promises";

child_process.execSync("npm ci", { stdio: "inherit" });


const YAML = await import("yaml");

const autogradingFile = await fs.readFile(".github/workflows/classroom.yml", { encoding: "utf-8" })
const autograding = YAML.parse(autogradingFile);
const steps = autograding?.jobs?.["run-autograding-tests"].steps;

if (!steps) {
  throw new Error("Could not find steps in the autograding file.");
}

const tests = steps
  .filter(({ uses }) => (
    uses.startsWith("education/autograding-io-grader") ||
    uses.startsWith("education/autograding-command-grader")
  ))
  .map(({ with: t }) => ({
    name: t["test-name"],
    setup: t["setup-command"],
    run: t.command,
    input: t.input,
    output: t["expected-output"],
    comparison: t["comparison-method"],
    timeout: t.timeout,
    points: t["max-score"],
  }))

await fs.mkdir(".github/classroom", {
  recursive: true
});

await fs.writeFile(".github/classroom/autograding.json", JSON.stringify(tests, null, 2));


