import { useState } from "react";
import * as Yup from "yup";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useFormik } from "formik";
import { BeatLoader } from "react-spinners";

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
} from "@chakra-ui/react";

import { APIData } from "@/common/types";

const defaultDataValue: APIData = {
	problemArea: "",
	goals: "",
	constraints: "",
	design: "",
	userStories: "",
	release: "",
	supportingData: "",
};

const validationSchema = Yup.object().shape({
	feature: Yup.string().required("Required"),
});

export default function Home() {
	const [rawData, setRawData] = useState<APIData>(defaultDataValue);
	const [error, setError] = useState<string | null>(null);

	const formik = useFormik({
		initialValues: {
			advanceMode: false,
			feature:
				"Facilitate flexible cross-platform communication within the app to enable direct conversation between company, homeowners, and contractors, with support as an escalation layer.",
			goal: "Reaching Positive Contribution Margin",
			success:
				"10% increase in Product satisfaction for homeowners and contractors, 80% user adoption, and 5% decrease in the number of tickets coming into kustomer per project",
			dependencies: "Using the existing NextJS application",
			timing: "the sprint starting on the 11th to the 25th of April",
		},
		validationSchema: validationSchema,
		onSubmit: (values, formik) => {
			fetch("/api/pm-ai-bot", {
				method: "POST",
				body: JSON.stringify(values),
			})
				.then((res) => res.json())
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

	return (
		<>
			<Head>
				<title>PM AI Bot</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className={styles.main}>
				<Box>
					<Heading display="flex" flexFlow="row" alignItems="center" mb={4} gap={4}>
						PM AI Bot
						{formik.isSubmitting && <BeatLoader size={8} />}
					</Heading>
					<Text mb={8} maxW={960}>
						The tool is designed to help Product Managers efficiently and effectively
						communicate their ideas. To begin, simply provide a brief summary of your
						idea or feature, which Company Goal it fits into, the definition of success,
						timing for launch, and key dependencies.
					</Text>
					{error && <Badge colorScheme="red">{error}</Badge>}
					<Box display="grid" gridTemplateColumns="1fr 2fr" gap={8}>
						<VStack alignItems={"flex-start"} maxW={960} gap={4}>
							<VStack w="100%" maxW={480} alignItems={"flex-start"}>
								<form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
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
										<Button
											type="submit"
											disabled={formik.isSubmitting}
											isLoading={formik.isSubmitting}
											spinnerPlacement="end"
											loadingText="Submitting"
										>
											Submit
										</Button>
										<Button type="button" onClick={() => formik.resetForm()}>
											Reset
										</Button>
									</ButtonGroup>
								</form>
							</VStack>
						</VStack>
						<VStack alignItems={"flex-start"}>
							{rawData.problemArea && (
								<>
									<Heading>Problem Area</Heading>
									{rawData.problemArea.split("\n\n").map((text, index) => (
										<Text key={`pa-paragraph-${index}`} mb={4}>
											{text}
										</Text>
									))}
								</>
							)}
							{rawData.goals && (
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
							)}
						</VStack>
					</Box>
				</Box>
			</main>
		</>
	);
}
