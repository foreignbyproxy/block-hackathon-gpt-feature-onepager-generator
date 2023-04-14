// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
	message: string;
	notionResponse: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const { code } = req.body;
	console.log({ code });

	const authorization = Buffer.from(
		`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_OAUTH_CLIENT_SECRET}`
	).toString("base64");

	try {
		const response = await fetch("https://api.notion.com/v1/oauth/token", {
			method: "POST",
			headers: {
				Authorization: `Basic ${authorization}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				grant_type: "authorization_code",
				code: code,
				redirect_uri:
					"https://foreignbyproxy-opulent-garbanzo-7x5w5v4rv7fx6v-4000.preview.app.github.dev",
			}),
		}).then((res) => res.json());

		res.status(200).json({
			message: "success",
			notionResponse: response,
		});
	} catch (error: any) {
		console.log(error.message);

		res.status(400);
	}
}
