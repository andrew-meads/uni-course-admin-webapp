import { withDatabase } from "./util.js";
import { ProjectGroup } from "../data/schema.js";
import {
  SMTP_FROM,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_SERVER,
  SMTP_USERNAME,
  SMTP_BCC
} from "../env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: SMTP_SERVER,
  port: SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD
  }
});

await withDatabase(async () => {
  let counter = 0;
  const groups = await ProjectGroup.find({}).populate("members.student");
  for (const group of groups) {
    try {
      await sendEmail(group);
    } catch (err) {
      console.error(`Could not send intro email for ${group.name}!`);
      console.error(err);
    }
    counter++;

    // if (counter === 3) break;
  }

  console.log(`${counter} groups processed.`);
});

async function sendEmail(group) {
  if (group.initialEmailSent)
    return console.log(`We have already sent the intro email for ${group.name}`);

  console.log(`Sending intro email for ${group.name}...`);

  const studentEmails = group.members.map(
    ({ student }) => `"${student.firstName} ${student.lastName}" <${student.emailAddress}>`
  );

  const result = await transporter.sendMail({
    from: SMTP_FROM,
    to: studentEmails,
    bcc: SMTP_BCC && SMTP_BCC.length > 0 ? SMTP_BCC : undefined,
    subject: `Group introduction for ${group.name}`,
    text: buildPlaintext(group),
    html: buildHtml(group)
  });

  //   console.log(result);
  console.log(`Email sent to members of ${group.name} (ID = ${result.messageId})`);

  group.initialEmailSent = true;
  await group.save();
}

function buildHtml(group) {
  const studentNames = group.members.map((m) => m.student.firstName);
  const allNames = studentNames.join(", ");

  return `
<p>Kia ora ${allNames},</p>
<p></p>
<p>Welcome to the COMPSCI718 / 719 project, and to Team ${group.name}! This email
is to e-introduce you all, and let you know your team's GitHub repository.</p>

<p>Please <a href="${group.githubUrl}">follow this link to the ${group.name} team GitHub respository</a>. You
each should have received an invite already.</p>

<p>If you have not received the invite, <strong>please reply to this email ASAP with your name, id,
UPI, and a link to your GitHub profule page.</strong></p>

<p>Once you do receive the invite, please accept it ASAP. It will expire within one week, after which
I will <strong>Not</strong> be issuing another one.</p>

<p>I hope you all enjoy the project, and I can't wait to see what you come up with!</p>

<p>Nga mihi,<br/>Andrew</p>
`;
}

function buildPlaintext(group) {
  const studentNames = group.members.map((m) => m.student.firstName);
  const allNames = studentNames.join(", ");

  return `
Kia ora ${allNames},

Welcome to the COMPSCI718 / 719 project, and to Team ${group.name}! This email
is to e-introduce you all, and let you know your team's GitHub repository.

Please follow this link to the ${group.name} team GitHub respository:

${group.githubUrl}

You each should have received an invite already.

If you have not received the invite, please reply to this email ASAP with your name, id,
UPI, and a link to your GitHub profule page.

Once you do receive the invite, please accept it ASAP. It will expire within one week, after which
I will Not be issuing another one.

I hope you all enjoy the project, and I can't wait to see what you come up with!

Nga mihi,
Andrew
`;
}
