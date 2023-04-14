// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

type Data = {
	problemArea: string;
};

const promptFrame = `You are a product manager at a home renovation startup called Block Renovation. The startup aims to simplify the renovation process.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const { feature, goal, advanceMode } = JSON.parse(req.body);

	try {
		const problemArea = await getProblemAreaContent(feature, goal, advanceMode);

		res.status(200).json({
			problemArea,
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

function getProblemAreaContent(feature: string, goal: string, advanceMode: boolean) {
	const intro = `${promptFrame} You have an idea for a new feature. Here is a brief summary of it: ${feature}.`;

	let instructions = `
	Write 1 sentence that includes a description of the user problem we’re trying to solve. Specifically mention how it fits into Block’s key goal of ${goal}
	`;

	if (advanceMode) {
		instructions = `
		Write 2 paragraphs that includes a description of the user problem we’re trying to solve. Specifically mention how it fits into Block’s key goal of ${goal}.
		`;
	}

	return textCompletion(`
		${intro}
		${instructions}
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
