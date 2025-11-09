import { useState } from 'react';
import axios from 'axios';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  text: { fontSize: 12 },
});

const ResumeDocument = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>{data.fullName}</Text>
        <Text style={styles.text}>{data.contact}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Summary</Text>
        <Text style={styles.text}>{data.summary}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Skills</Text>
        <Text style={styles.text}>{data.skills}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Work Experience</Text>
        <Text style={styles.text}>{data.experience}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Education</Text>
        <Text style={styles.text}>{data.education}</Text>
      </View>
    </Page>
  </Document>
);

export default function Home() {
  const [form, setForm] = useState({
    fullName: '',
    contact: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    tailored: false,
    jobDescription: '',
  });

  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateResume = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/generate-resume', form);
      setResumeData(response.data.resume);
    } catch {
      alert('Error generating resume.');
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    if (!resumeData) return;
    const blob = await pdf(<ResumeDocument data={resumeData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SmartResume.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">SmartResume Builder</h1>
      <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="border p-3 rounded w-full mb-4" />
      <input name="contact" placeholder="Contact Info" value={form.contact} onChange={handleChange} className="border p-3 rounded w-full mb-4" />
      <textarea name="summary" placeholder="Summary" value={form.summary} onChange={handleChange} className="border p-3 rounded w-full mb-4" rows={3} />
      <textarea name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} className="border p-3 rounded w-full mb-4" rows={2} />
      <textarea name="experience" placeholder="Work Experience" value={form.experience} onChange={handleChange} className="border p-3 rounded w-full mb-4" rows={4} />
      <textarea name="education" placeholder="Education" value={form.education} onChange={handleChange} className="border p-3 rounded w-full mb-4" rows={3} />
      <label className="flex items-center mb-4">
        <input type="checkbox" name="tailored" checked={form.tailored} onChange={handleChange} className="mr-2" />
        Tailor to job description
      </label>
      {form.tailored && (
        <textarea name="jobDescription" placeholder="Job Description for tailoring" value={form.jobDescription} onChange={handleChange} className="border p-3 rounded w-full mb-4" rows={4} />
      )}
      <button onClick={generateResume} disabled={loading} className="bg-blue-700 text-white p-3 rounded w-full mb-4">
        {loading ? 'Generating...' : 'Generate Resume'}
      </button>
      {resumeData && (
        <>
          <pre className="bg-gray-100 p-4 rounded mb-4 whitespace-pre-wrap">{JSON.stringify(resumeData, null, 2)}</pre>
          <button onClick={downloadPDF} className="bg-green-600 text-white p-3 rounded w-full">
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}
