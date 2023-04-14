// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { Client } = require("@notionhq/client");
import type { NextApiRequest, NextApiResponse } from "next";
import { sections } from "@/common/consts";
import { SectionKeys } from "@/common/types";

type Data = {
	message: string;
	notionresponse: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const { token, data } = req.body;

	try {
		const notion = new Client({
			auth: token,
		});

		const response = await notion.pages.create({
			parent: {
				type: "page_id",
				page_id: "fcc11287-f4c5-485b-8866-698f702b86b0",
			},
			cover: {
				type: "external",
				external: {
					url: "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg",
				},
			},
			icon: {
				type: "emoji",
				emoji: "🥬",
			},
			properties: {
				title: {
					title: [{ type: "text", text: { content: data.title } }],
				},
			},
			children: Object.entries(sections).reduce<any>((carry, [k, section]) => {
				const key = k as SectionKeys;

				carry.push({
					object: "block",
					heading_2: {
						rich_text: [
							{
								text: {
									content: section.header,
								},
							},
						],
					},
				});

				carry.push({
					object: "block",
					paragraph: {
						rich_text: [
							{
								text: {
									content: data[key],
								},
							},
						],
						color: "default",
					},
				});

				return carry;
			}, []),
		});

		res.status(200).json({
			message: "success",
			notionresponse: response,
		});
	} catch (error: any) {
		console.log(error.message);

		res.status(400);
	}
}
