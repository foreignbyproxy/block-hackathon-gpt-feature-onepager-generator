import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import styles from "@/styles/Home.module.css";

import {
	Heading,
	Text,
	Box,
	FormControl,
	FormLabel,
	Button,
	Textarea,
	VStack,
	Select,
	Switch,
	Badge,
	ButtonGroup,
	Input,
	HStack,
} from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";

import {
	getGPTResponse,
	getNotionAccessToken,
	sendPageDataToNotion,
	formatNotionPageId,
} from "@/common/utils";
import { sections } from "@/common/consts";

import { APIData, NotionResponse, SectionKeys } from "@/common/types";

export const isSsr = typeof window === "undefined";

const defaultDataValue: APIData = {
	title: "",
	problemArea: "",
	goals: "",
	constraints: "",
	design: "",
	userStories: "",
	release: "",
	supportingData: "",
};

const validationSchema = Yup.object().shape({
	title: Yup.string().required("Required"),
	feature: Yup.string().required("Required"),
});

export default function Home() {
	const router = useRouter();
	const [isSendingToNotion, setIsSendingToNotion] = useState<boolean>(false);
	const [rawData, setRawData] = useState<APIData>(defaultDataValue);
	const [pageId, setPageId] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [notionResponse, setNotionToken] = useState<NotionResponse | null>(() => {
		if (!isSsr) {
			const notionLocalStorage = window.localStorage.getItem("notion-cookie");
			if (notionLocalStorage) {
				return JSON.parse(notionLocalStorage);
			}
		}

		return null;
	});

	const formik = useFormik({
		initialValues: {
			title: "Test One Pager",
			advanceMode: false,
			feature:
				"Facilitate flexible cross-platform communication within the app to enable direct conversation between company, homeowners, and contractors, with support as an escalation layer.",
			goal: "Reaching Positive Contribution Margin",
			success:
				"10% increase in Product satisfaction for homeowners and contractors, 80% user adoption, and 5% decrease in the number of tickets coming into kustomer per project",
			dependencies: "The feature should be implemented using our NextJS application.",
			timing: "The feature should be finished by the end of the month.",
		},
		validationSchema: validationSchema,
		onSubmit: (values, formik) => {
			getGPTResponse(values)
				.then((data) => {
					setRawData(data);
					console.log(data);
					formik.setSubmitting(false);
				})
				.catch((error) => {
					setError("PM AI Bot could not generate one-pager");
					console.log(error);
					formik.setSubmitting(false);
				});
		},
	});

	useEffect(() => {
		if (!notionResponse && router.query?.code) {
			getNotionAccessToken(router.query.code)
				.then((data) => {
					if (data.notionResponse?.error) {
						debugger;
						setError("PM AI Bot could not get Notion access token");
						console.log(error);
						return;
					}

					if (data.notionResponse.access_token) {
						debugger;
						console.log(data);
						setNotionToken(data.notionResponse);
						localStorage.setItem("notion-cookie", JSON.stringify(data.notionResponse));
						router.push("/");
					}
				})
				.catch((error) => {
					debugger;
					setError("PM AI Bot could not get Notion access token");
					console.log(error);
				});
		}
	}, [router]);

	function sendDataToNotion() {
		setIsSendingToNotion(true);
		setError(null);
		setSuccess(null);

		if (!pageId) {
			setError("Need to add Page ID");
			setIsSendingToNotion(false);
			return;
		}

		sendPageDataToNotion(rawData, formatNotionPageId(pageId))
			.then(() => {
				setSuccess("Data added to Notion");
				setIsSendingToNotion(false);
			})
			.catch((error) => {
				setError("Failed to add page to Notion");
				setIsSendingToNotion(false);
			});
	}

	return (
		<>
			<Head>
				<title>PM AI Bot</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className={styles.main}>
				<Box>
					<VStack alignItems={"flex-start"} gap={4} mb={8}>
						<Heading display="flex" flexFlow="row" alignItems="center" gap={4}>
							PM AI Bot
							{(formik.isSubmitting || isSendingToNotion) && <BeatLoader size={8} />}
						</Heading>
						<Text maxW={960}>
							The tool is designed to help Product Managers efficiently and
							effectively communicate their ideas. To begin, simply provide a brief
							summary of your idea or feature, which Company Goal it fits into, the
							definition of success, timing for launch, and key dependencies.
						</Text>
						{!notionResponse && (
							<Button
								as="a"
								href="https://api.notion.com/v1/oauth/authorize?client_id=b061d895-06e9-4308-93b0-18ca23279dac&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fforeignbyproxy-opulent-garbanzo-7x5w5v4rv7fx6v-4000.preview.app.github.dev"
							>
								Connect to Notion
							</Button>
						)}
						{notionResponse && isFilled(rawData) && (
							<HStack w="640px" gap={4}>
								<Button isLoading={isSendingToNotion} onClick={sendDataToNotion}>
									Add to Notion
								</Button>
								<FormControl mb={4}>
									<Input
										placeholder="Insert Parent Page ID"
										id="pageId"
										name="pageId"
										onChange={(e) => {
											setPageId(e.currentTarget.value);
										}}
										value={pageId}
									/>
								</FormControl>
							</HStack>
						)}
						{error && <Badge colorScheme="red">{error}</Badge>}
						{success && <Badge colorScheme="green">{success}</Badge>}
					</VStack>
					<Box display="grid" gridTemplateColumns="1fr 2fr" gap={8}>
						<VStack alignItems={"flex-start"} maxW={960} gap={4}>
							<VStack w="100%" maxW={480} alignItems={"flex-start"}>
								<form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
									<FormControl mb={4}>
										<FormLabel>Description of Feature</FormLabel>
										<Input
											id="title"
											name="title"
											onChange={formik.handleChange}
											value={formik.values.title}
										/>
									</FormControl>

									<FormControl mb={4}>
										<FormLabel>Advance Mode</FormLabel>
										<Switch
											id="advanceMode"
											name="advanceMode"
											onChange={formik.handleChange}
											colorScheme="teal"
											size="lg"
										/>
									</FormControl>

									<FormControl mb={4}>
										<FormLabel>Description of Feature</FormLabel>
										<Textarea
											minHeight="360px"
											id="feature"
											name="feature"
											onChange={formik.handleChange}
											value={formik.values.feature}
											placeholder="Describe Your Feature"
										/>
									</FormControl>

									<FormControl mb={4}>
										<FormLabel>Company Goal</FormLabel>
										<Select
											id="goal"
											name="goal"
											onChange={formik.handleChange}
											value={formik.values.goal}
											placeholder="Select option"
										>
											<option value="Reaching Positive Contribution Margin">
												Reaching Positive Contribution Margin
											</option>
											<option value="Evolving the product to Block 2.0">
												Evolving the product to Block 2.0
											</option>
										</Select>
									</FormControl>

									<FormControl mb={4}>
										<FormLabel>Definition of Success</FormLabel>
										<Textarea
											minHeight="200px"
											id="success"
											name="success"
											onChange={formik.handleChange}
											value={formik.values.success}
										/>
									</FormControl>

									<FormControl mb={4}>
										<FormLabel>Dependencies</FormLabel>
										<Textarea
											id="dependencies"
											name="dependencies"
											onChange={formik.handleChange}
											value={formik.values.dependencies}
										/>
									</FormControl>

									<FormControl mb={4}>
										<FormLabel>Timing</FormLabel>
										<Textarea
											id="timing"
											name="timing"
											onChange={formik.handleChange}
											value={formik.values.timing}
										/>
									</FormControl>

									<ButtonGroup>
										<Button type="button" onClick={() => formik.resetForm()}>
											Reset
										</Button>
										<Button
											type="submit"
											disabled={formik.isSubmitting}
											isLoading={formik.isSubmitting}
											spinnerPlacement="end"
											loadingText="Submitting"
											colorScheme="green"
										>
											Submit
										</Button>
									</ButtonGroup>
								</form>
							</VStack>
						</VStack>
						<VStack alignItems={"flex-start"}>
							{isFilled(rawData) &&
								Object.entries(sections).map(([k, section]) => {
									const key = k as SectionKeys;

									return (
										<>
											<Heading>{section.header}</Heading>

											{section.type === "paragraph" &&
												rawData[key].split("\n\n").map((text, index) => (
													<Text key={`pa-paragraph-${index}`} mb={4}>
														{text}
													</Text>
												))}

											{section.type === "list" && (
												<Box
													pl={4}
													dangerouslySetInnerHTML={{
														__html: rawData[key],
													}}
												/>
											)}
										</>
									);
								})}

							{/* {rawData.goals && (
								<>
									<Heading>Goals</Heading>
									{rawData.goals.split("\n\n").map((text, index) => (
										<Text key={`g-paragraph-${index}`} mb={4}>
											{text}
										</Text>
									))}
								</>
							)}
							{rawData.constraints && (
								<>
									<Heading>Constraints</Heading>
									{rawData.constraints.split("\n\n").map((text, index) => (
										<Text key={`c-paragraph-${index}`} mb={4}>
											{text}
										</Text>
									))}
								</>
							)}
							{rawData.design && (
								<>
									<Heading>Design Concept</Heading>
									{rawData.design.split("\n\n").map((text, index) => (
										<Text key={`d-paragraph-${index}`} mb={4}>
											{text}
										</Text>
									))}
								</>
							)}
							{rawData.userStories && (
								<>
									<Heading>User Stories</Heading>
									<Box
										pl={4}
										dangerouslySetInnerHTML={{ __html: rawData.userStories }}
									/>
								</>
							)}
							{rawData.release && (
								<>
									<Heading>Release Strategy</Heading>
									{rawData.release.split("\n\n").map((text, index) => (
										<Text key={`r-paragraph-${index}`} mb={4}>
											{text}
										</Text>
									))}
								</>
							)}
							{rawData.supportingData && (
								<>
									<Heading>Supporting Data</Heading>
									<Box
										pl={4}
										dangerouslySetInnerHTML={{ __html: rawData.supportingData }}
									/>
								</>
							)} */}
						</VStack>
					</Box>
				</Box>
			</main>
		</>
	);
}

function isFilled(rawData: APIData) {
	return Object.values(rawData).every((item) => item);
}
