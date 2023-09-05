import { InterviewGroupedEvidences } from "./constants";

export const getGroupedEvidences = (ids: number[]) => {
	const groups: EvidencesGroup[] = [];
	InterviewGroupedEvidences.forEach(group => {
		const items = group.items.filter(item => ids.includes(item.id as number));
		if (items.length) {
			groups.push({
				element_id: group.element_id,
				element: group.element,
				items: items,
			})
		}
	})
	return groups;
}
