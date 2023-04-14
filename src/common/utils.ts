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

export function sendPageDataToNotion(data: APIData) {
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
		}),
	}).then((res) => res.json());
}
