import { useState } from "react";

import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useFormik } from "formik";
import { BeatLoader } from "react-spinners";

const inter = Inter({ subsets: ["latin"] });

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
} from "@chakra-ui/react";

type RawData = {
	problemArea: string;
};

const defaultValue = {
	problemArea: "",
};

export default function Home() {
	const [rawData, setRawData] = useState<RawData>(defaultValue);

	const formik = useFormik({
		initialValues: {
			advanceMode: false,
			feature: "",
			goal: "",
			success: "",
			dependencies: "",
		},
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
					<Box display="grid" gridTemplateColumns="1fr 2fr">
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

									<Button
										type="submit"
										disabled={formik.isSubmitting}
										isLoading={formik.isSubmitting}
										spinnerPlacement="end"
										loadingText="Submitting"
									>
										Submit
									</Button>
								</form>
							</VStack>
						</VStack>
						<VStack alignItems={"flex-start"}>
							<Heading>Problem Area</Heading>
							{rawData.problemArea.split("\n\n").map((text, index) => (
								<Text key={`pa-paragraph-${index}`} mb={4}>
									{text}
								</Text>
							))}
						</VStack>
					</Box>
				</Box>
				<Box maxW={960}>
					<pre style={{ textWrap: "wrap" }}>{JSON.stringify(rawData, null, 4)}</pre>
				</Box>
			</main>
		</>
	);
}
