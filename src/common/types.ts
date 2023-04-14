import { string } from "yup";

export type SectionKeys =
	| "problemArea"
	| "goals"
	| "constraints"
	| "design"
	| "userStories"
	| "release"
	| "supportingData";

export type UISection = {
	header: string;
	type: string;
};

export type FormValues = {
	advanceMode: boolean;
	feature: string;
	goal: string;
	success: string;
	dependencies: string;
	timing: string;
};

export type APIData = {
	[k in SectionKeys | "title"]: string;
};

export type getNotionAccessTokenResponse = {
	message: string;
	notionResponse: NotionResponse;
};

export type NotionResponse = {
	error?: string;
	access_token: string;
	workspace_id: string;
	workspace_name: string;
};
