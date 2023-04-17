import { FormValues, APIData, getNotionAccessTokenResponse, NotionResponse } from "./types";

function getNotionDataFromLocalStorage() {
	let notion: null | NotionResponse = null;
	const notionLocalStorage = window.localStorage.getItem("notion-cookie");
	if (notionLocalStorage) {
		notion = JSON.parse(notionLocalStorage) as NotionResponse;
	}

	return notion;
}

export function getGPTResponse(values: FormValues) {
	return fetch("/api/pm-ai-bot", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(values),
	}).then((res) => res.json());
}

export function getNotionAccessToken(
	code: string | string[]
): Promise<getNotionAccessTokenResponse> {
	return fetch("/api/notion-auth", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ code }),
	}).then((res) => res.json());
}

export function sendPageDataToNotion(data: APIData, pageId: string) {
	let notion = getNotionDataFromLocalStorage();

	if (!notion) {
		throw new Error(
			"Missing Notion Authorization informantion. Please reauthenticate with Notion."
		);
	}

	return fetch("/api/notion-add-page", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			token: notion.access_token,
			data,
			pageId,
		}),
	}).then((res) => res.json());
}

export function formatNotionPageId(pageId: string) {
	const seg1 = pageId.substring(0, 8);
	const seg2 = pageId.substring(8, 12);
	const seg3 = pageId.substring(12, 16);
	const seg4 = pageId.substring(16, 20);
	const seg5 = pageId.substring(20);

	return `${seg1}-${seg2}-${seg3}-${seg4}-${seg5}`;
}
