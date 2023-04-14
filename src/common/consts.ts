import { SectionKeys, UISection } from "./types";

export const sections: Record<SectionKeys, UISection> = {
	problemArea: {
		header: "Problem Area",
		type: 'paragraph'
	},
	goals: {
		header: "Goals",
		type: 'paragraph'
	},
	constraints: {
		header: "Constraints",
		type: 'paragraph'
	},
	design: {
		header: "Design Concept",
		type: 'paragraph'
	},
	userStories: {
		header: "User Stories",
		type: 'list'
	},
	release: {
		header: "Release Strategy",
		type: 'paragraph'
	},
	supportingData: {
		header: "Supporting Data",
		type: 'list'
	},
};
