// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { APIData } from "@/common/types";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse<APIData>) {
	const { feature, goal, success, timing, dependencies, title, advanceMode } = req.body;

	const promptBlockFraming = `You are a product manager at a home renovation startup called Block Renovation. The startup aims to simplify the renovation process.`;

	const promptFeatureFraming = `
	${promptBlockFraming}
	You have an idea for a new feature. Here is a brief summary of it: ${feature}.
	`;

	try {
		const [problemArea, goals, constraints, design, userStories, release, supportingData] =
			await Promise.all([
				getProblemArea(promptFeatureFraming, goal, advanceMode),
				getGoals(promptFeatureFraming, success, advanceMode),
				getConstraints(promptFeatureFraming, timing, dependencies, advanceMode),
				getDesign(promptFeatureFraming, advanceMode),
				getUserStories(promptFeatureFraming, advanceMode),
				getRelease(promptFeatureFraming, advanceMode),
				getSupportingData(promptFeatureFraming, advanceMode),
			]);

		res.status(200).json({
			title,
			problemArea,
			goals,
			constraints,
			design,
			userStories,
			release,
			supportingData,
		});
	} catch (error: any) {
		if (error?.response) {
			console.log(error.response.status);
			console.log(error.response.data);
		} else {
			console.log(error.message);
		}

		res.status(400);
	}
}

async function getProblemArea(promptFrame: string, goal: string, advanceMode: boolean) {
	let instructions = `
	Write 1 sentence that includes a description of the user problem we’re trying to solve. Specifically mention how it fits into Block’s key goal of ${goal}
	`;

	if (advanceMode) {
		instructions = `
		Write 2 paragraphs that includes a description of the user problem we’re trying to solve. Specifically mention how it fits into Block’s key goal of ${goal}.
		`;
	}

	return textCompletion(`
		${promptFrame}
		${instructions}
	`);
}

async function getGoals(promptFrame: string, success: string, advanceMode: boolean) {
	let instructions = `
	Write 1 sentence that describes what we are trying to achieve with this product and briefly describes how success is measured.
	`;

	if (advanceMode) {
		instructions = `
		Write 2 paragraphs that describes what we are trying to achieve with this product and describes how success is measured.
		`;
	}

	return textCompletion(`
		${promptFrame}
		${instructions}
		${success && `Here is extra information about what defines success: ${success}`}
	`);
}

async function getConstraints(
	promptFrame: string,
	timing: string,
	dependencies: string,
	advanceMode: boolean
) {
	let instructions = `
	Write a 1 sentence that describes that the timing is ${timing}, the dependencies are ${dependencies}.
	`;

	if (advanceMode) {
		instructions = `
		Write 1 paragraphs that describes that the timing is ${timing} and the dependencies are ${dependencies}.
		`;
	}

	return textCompletion(`
		${promptFrame}
		${instructions}
	`);
}

async function getDesign(promptFrame: string, advanceMode: boolean) {
	let instructions = `
	Write 2 sentences that describes the potential design approach and design solution.
	`;

	if (advanceMode) {
		instructions = `
		Write 2 paragraphs that describes the potential design approach and design solution.
		`;
	}

	return textCompletion(`
		${promptFrame}
		${instructions}
	`);
}

async function getUserStories(promptFrame: string, advanceMode: boolean) {
	let instructions = `
	In a list format, write 3 user stories to illustrate the high-level user experience in the format: “As a [user], I [can/want/will] [something].
	`;

	if (advanceMode) {
		instructions = `
		In a list format, write 10 user stories to illustrate the high-level user experience in the format: “As a [user], I [can/want/will] [something].”
		`;
	}

	return textCompletion(`
		${promptFrame}
		${instructions}
		Output the list in an HTML ol element.
	`);
}

async function getRelease(promptFrame: string, advanceMode: boolean) {
	let instructions = `
	Write 2 sentence that describes how and when do we plan to launch this (if it will be A/B test, how it will be launched, etc).
	`;

	if (advanceMode) {
		instructions = `
		Write 2-3 paragraphs that describes how and when do we plan to launch this (if it will be A/B test, how it will be launched, etc).
		`;
	}

	return textCompletion(`
		${promptFrame}
		${instructions}
	`);
}

async function getSupportingData(promptFrame: string, advanceMode: boolean) {
	let instructions = `
	Create 3 bullets with market research highlighting evidence of why the idea is specifically a good idea and evidence of why we are confident it will work.
	`;

	if (advanceMode) {
		instructions = `
		Create 10 bullets with market research highlighting evidence of why the idea is specifically a good idea and evidence of why we are confident it will work.
		`;
	}

	return textCompletion(`
		${promptFrame}
		${instructions}
		Output the list in an HTML ol element.
	`);
}

function textCompletion(prompt: string) {
	return openai
		.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.9,
		})
		.then((response) => {
			return response.data?.choices?.[0]?.message?.content || "";
		});
}
