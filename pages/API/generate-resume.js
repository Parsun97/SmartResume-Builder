import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fullName, contact, summary, skills, experience, education, tailored, jobDescription } = req.body;

  let prompt = `Create a clean, ATS-friendly resume in JSON format with these fields: fullName, contact, summary, skills, experience, education.\n\nName: ${fullName}\nContact: ${contact}\nSummary: ${summary}\nSkills: ${skills}\nExperience: ${experience}\nEducation: ${education}\n`;

  if (tailored && jobDescription) {
    prompt += `Tailor the resume to this job description:\n${jobDescription}\n`;
  }

  prompt += `\nReturn the resume as a JSON object only.`;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 700,
      temperature: 0.7,
    });

    let resume;
    try {
      resume = JSON.parse(completion.data.choices[0].text.trim());
    } catch {
      resume = { fullName, contact, summary, skills, experience, education };
    }

    res.status(200).json({ resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate resume' });
  }
}
