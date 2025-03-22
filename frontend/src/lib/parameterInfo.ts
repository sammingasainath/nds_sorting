interface ParameterInfo {
  [key: string]: {
    description: string;
    weight?: string;
    category?: string;
    formula?: string;
    fullName?: string;
    examples?: string;
    importance?: string;
  };
}

export const parameterInfo: ParameterInfo = {
  "SS": {
    category: "Teaching, Learning & Resources (TLR)",
    description: "Student Strength including Doctoral Students: Evaluates the total number of students at different levels. Calculated using total sanctioned intake (NT), enrolled students (NE), and doctoral students (NP).",
    weight: "20",
    formula: "SS = f(NT, NE) × 15 + f(NP) × 5",
    fullName: "Student Strength",
    examples: "Higher values indicate larger student bodies with good enrollment rates.",
    importance: "A crucial metric that reflects the institution's capacity and popularity among students."
  },
  "FSR": {
    category: "Teaching, Learning & Resources (TLR)",
    description: "Faculty-Student Ratio: Measures the ratio between permanent faculty members and enrolled students to ensure effective teaching and learning quality.",
    weight: "30",
    fullName: "Faculty-Student Ratio",
    examples: "A lower ratio (more faculty per student) indicates more personalized attention to students.",
    importance: "Critical metric that directly impacts the quality of teaching and mentorship available to students."
  },
  "FQE": {
    category: "Teaching, Learning & Resources (TLR)",
    description: "Faculty Qualification & Experience: Assesses faculty members' qualifications (PhD or equivalent) and experience, giving equal weight to both academic credentials and practical experience.",
    weight: "15",
    fullName: "Faculty Qualification & Experience",
    examples: "Higher percentage of PhD-holding faculty and more experienced professors contributes to better scores.",
    importance: "Reflects the academic quality and expertise level of the teaching staff."
  },
  "FRU": {
    category: "Teaching, Learning & Resources (TLR)",
    description: "Financial Resources Utilization: Evaluates the institution's financial health and effectiveness in utilizing available resources for academic and infrastructure development.",
    weight: "5",
    fullName: "Financial Resources Utilization",
    examples: "Efficient spending on laboratory equipment, libraries, and academic facilities improves this score.",
    importance: "Indicates how well the institution manages its finances to benefit educational quality."
  },
  "PU": {
    category: "Research and Professional Practice (RP)",
    description: "Publications: Assesses the quantity and quality of research publications, including factors like citation impact and publication volume.",
    weight: "10",
    fullName: "Publications",
    examples: "Number of research papers published in reputed journals per faculty member.",
    importance: "Key indicator of the institution's contribution to knowledge creation and research output."
  },
  "QP": {
    category: "Research and Professional Practice (RP)",
    description: "Quality of Publications: Evaluates the impact of research through citation metrics and publication quality indicators.",
    weight: "15",
    fullName: "Quality of Publications",
    examples: "Citations per paper, h-index scores, and publications in high-impact journals.",
    importance: "Reflects the influence and recognition of the institution's research in academic circles."
  },
  "IPR": {
    category: "Research and Professional Practice (RP)",
    description: "Intellectual Property Rights: Measures intellectual property generation through patents, copyrights, and designs. Considers both published and granted patents.",
    weight: "10",
    fullName: "Intellectual Property Rights",
    examples: "Number of patents filed and granted, technology transfers executed.",
    importance: "Demonstrates the institution's innovation capacity and commercial application of research."
  },
  "FPPP": {
    category: "Research and Professional Practice (RP)",
    description: "Footprint of Projects & Professional Practice: Evaluates the institution's engagement in research projects, professional practices, and executive development initiatives.",
    weight: "10",
    fullName: "Footprint of Projects & Professional Practice",
    examples: "Sponsored research projects, consultancy services, and industry collaborations.",
    importance: "Shows how well the institution connects academic work with real-world applications."
  },
  "GPH": {
    category: "Graduation Outcomes (GO)",
    description: "Graduation Placement & Higher Studies: Measures the success rate of students in securing placements or pursuing higher education after graduation.",
    weight: "15",
    fullName: "Graduation Placement & Higher Studies",
    examples: "Percentage of graduates employed or enrolled in further education within one year of graduation.",
    importance: "Direct indicator of how well graduates fare in career opportunities after completing their education."
  },
  "GUE": {
    category: "Graduation Outcomes (GO)",
    description: "Graduation University Examinations: Evaluates student performance in university examinations and academic assessments.",
    weight: "10",
    fullName: "Graduation University Examinations",
    examples: "Average CGPA/marks of graduating students, pass rates in degree examinations.",
    importance: "Reflects the academic achievement levels of the student body."
  },
  "MS": {
    category: "Graduation Outcomes (GO)",
    description: "Median Salary: Considers the median salary of graduating students as an indicator of employment quality.",
    weight: "10",
    fullName: "Median Salary",
    examples: "The middle value of all starting salaries offered to graduating students.",
    importance: "Indicates the economic value of degrees from the institution in the job market."
  },
  "GPHD": {
    category: "Graduation Outcomes (GO)",
    description: "Graduating PhD Students: Assesses the institution's contribution to doctoral education.",
    weight: "10",
    fullName: "Graduating PhD Students",
    examples: "Number of PhD degrees awarded annually relative to faculty size.",
    importance: "Demonstrates the institution's commitment to advanced research training."
  },
  "RD": {
    category: "Outreach and Inclusivity (OI)",
    description: "Regional Diversity: Measures the institution's success in attracting students from diverse regional and national backgrounds.",
    weight: "10",
    fullName: "Regional Diversity",
    examples: "Percentage of students from different states and countries.",
    importance: "Reflects the cosmopolitan nature of campus and exposure to diverse perspectives."
  },
  "WD": {
    category: "Outreach and Inclusivity (OI)",
    description: "Women Diversity: Assesses the representation and support for women among students and faculty.",
    weight: "10",
    fullName: "Women Diversity",
    examples: "Percentage of female students and faculty members.",
    importance: "Indicates gender equality and inclusiveness in the institution."
  },
  "ESCS": {
    category: "Outreach and Inclusivity (OI)",
    description: "Economically & Socially Challenged Students: Evaluates the institution's efforts in including and supporting students from disadvantaged backgrounds.",
    weight: "10",
    fullName: "Economically & Socially Challenged Students",
    examples: "Enrollment rates of students from low-income families and marginalized communities.",
    importance: "Shows the institution's commitment to providing equal opportunities regardless of socioeconomic status."
  },
  "PCS": {
    category: "Outreach and Inclusivity (OI)",
    description: "Physically Challenged Students: Assesses the infrastructure and support systems available for physically challenged students.",
    weight: "10",
    fullName: "Physically Challenged Students",
    examples: "Accessibility features, specialized support services, and enrollment rates of differently-abled students.",
    importance: "Demonstrates the institution's commitment to inclusive education for all abilities."
  },
  "PR": {
    category: "Perception (PR)",
    description: "Perception Ranking: Measures the institution's reputation among academic peers, employers, and other stakeholders.",
    weight: "10",
    fullName: "Perception Ranking",
    examples: "Survey results from employers, academics, and alumni about institutional quality.",
    importance: "Reflects the overall standing and reputation of the institution in society and industry."
  }
}; 