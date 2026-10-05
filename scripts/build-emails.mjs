// PCEC account correspondence. Run with Node to rebuild the templates and preview.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, 'email-templates');
await mkdir(out, { recursive: true });
const messages = [
  { id:'password-reset', label:'Forgot password', slot:'Reset password', subject:'Set a new password for PCEC Connect', category:'ACCOUNT ASSISTANCE', title:'Set a new password.', intro:'A password reset was requested for your PCEC Connect account.', detail:'Choose a new password below to return to your church updates, events and community.', button:'Choose a new password', note:'If you did not request this, no action is needed. Your password will stay the same.', status:'Already requested from the app. The new email design still needs to be saved in the email service.' },
  { id:'confirm-email', label:'Confirm email', slot:'Confirm sign up', subject:'Welcome to PCEC Connect — confirm your email', category:'MEMBER REGISTRATION', title:'One step before<br>you join us.', intro:'Welcome to PCEC Connect, the member app of the Philippine Council of Evangelical Churches.', detail:'Confirm this email address to finish creating your account. You can then follow church updates, find events and connect with fellow members.', button:'Confirm my email', note:'If you did not create a PCEC Connect account, you can ignore this message.', status:'Design ready. Email confirmation is still switched off in the live service.' },
  { id:'verification-code', label:'Verification code', slot:'Reauthentication', subject:'Your PCEC Connect verification code', category:'ACCOUNT VERIFICATION', title:'Confirm it’s you.', intro:'Use this verification code to confirm the account change you requested in PCEC Connect.', detail:'Return to the screen where you requested the code and enter the six digits below.', code:true, note:'Keep this code to yourself. If you did not request it, do not enter it anywhere.', status:'Design ready for account verification. This is a verification email, not the administrator’s authenticator-app code.' },
  { id:'password-changed', label:'Password changed', slot:'Password changed notification', subject:'Your PCEC Connect password was changed', category:'ACCOUNT NOTICE', title:'Your password<br>was changed.', intro:'The password for your PCEC Connect account has been changed.', detail:'If you made this change, you can continue using the app with your new password.', destination:'{{ .SiteURL }}/forgot-password', button:'Reset my password', note:'If this was not you, reset your password now and contact the PCEC office through its official website.', status:'Design ready. The password-change email notification needs to be switched on in the email service.' },
  { id:'email-change', label:'Change email', slot:'Change email address', subject:'Confirm your new PCEC Connect email address', category:'ACCOUNT DETAILS', title:'Confirm your<br>new email address.', intro:'A change to the email address on your PCEC Connect account was requested.', detail:'The requested new address is <strong>{{ .NewEmail }}</strong>. Use the button below to confirm the change.', button:'Confirm email change', note:'If you did not request this change, do not confirm it. Contact the PCEC office through its official website.', status:'Design ready for future email-address changes. This does not add a new email-change screen to the app.' },
  { id:'mfa-enabled', label:'2-step login added', slot:'Verification method added notification', subject:'2-step verification added to your PCEC Connect account', category:'SIGN-IN SECURITY', title:'An extra sign-in<br>check was added.', intro:'A new verification method was added to your PCEC Connect account.', detail:'This adds an extra check when you sign in. If you set it up, no further action is needed.', destination:'{{ .SiteURL }}/login', button:'Open PCEC Connect', note:'If you did not add this verification method, contact the PCEC office promptly through its official website.', status:'Design ready. Administrator 2-step login is still a separate setup task; this template does not switch it on.' },
  { id:'mfa-removed', label:'2-step login removed', slot:'Verification method removed notification', subject:'A verification method was removed from PCEC Connect', category:'SIGN-IN SECURITY', title:'A sign-in check<br>was removed.', intro:'A verification method was removed from your PCEC Connect account.', detail:'If you removed it, review your account settings before continuing.', destination:'{{ .SiteURL }}/login', button:'Review my account', note:'If you did not remove this verification method, contact the PCEC office promptly through its official website.', status:'Design ready. This notification must be enabled when 2-step login is introduced.' },
  { id:'sign-in-link', label:'Sign-in link', slot:'Magic link', subject:'Your sign-in link for PCEC Connect', category:'MEMBER SIGN-IN', title:'Return to your<br>PCEC community.', intro:'A sign-in link was requested for your PCEC Connect account.', detail:'Use the button below to open your account and continue to church updates, events and the community feed.', button:'Sign in to PCEC Connect', note:'If you did not request this link, do not use or forward it.', status:'Design ready for sign-in links. The app currently uses email and password; this does not add a new sign-in method.' },
];

function email(m) {
  const link=m.destination || '{{ .ConfirmationURL }}';
  const action=m.code
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0;background:#f6f2eb;border-left:3px solid #cf861c"><tr><td align="center" style="padding:22px 12px"><p style="margin:0 0 10px;font:11px Arial,sans-serif;letter-spacing:1.7px;color:#5f6470">YOUR VERIFICATION CODE</p><p style="margin:0;font:700 34px 'Courier New',monospace;letter-spacing:7px;color:#1a2744">{{ .Token }}</p></td></tr></table>`
    : `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 26px"><tr><td bgcolor="#1a2744" style="border-radius:3px"><a href="${link}" style="display:inline-block;padding:16px 24px;color:#ffffff;text-decoration:none;font:700 15px Arial,sans-serif">${m.button}&nbsp; &#8594;</a></td></tr></table>`;
  const fallback= m.code ? '' : `<p style="margin:25px 0 7px;font:12px/1.6 Arial,sans-serif;color:#656c76">If the button does not open, copy this address into your browser:</p><p style="margin:0;font:11px/1.7 Arial,sans-serif;word-break:break-all;overflow-wrap:anywhere"><a href="${link}" style="color:#586780;text-decoration:underline">${link}</a></p>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${m.subject}</title>
<style>@media screen and (max-width:620px){.email-shell{width:100%!important}.email-pad{padding-left:26px!important;padding-right:26px!important}.email-title{font-size:31px!important}.outside-pad{padding:14px 10px!important}}a:focus{outline:2px solid #cf861c;outline-offset:3px}</style></head>
<body style="margin:0;padding:0;background:#eeeae3;color:#1a2744">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px">${m.intro}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eeeae3"><tr><td class="outside-pad" align="center" style="padding:34px 16px">
<table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;background:#ffffff;border-top:5px solid #1a2744">
<tr><td class="email-pad" style="padding:27px 44px 24px;border-bottom:1px solid #e8e4dd"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td width="84" bgcolor="#1a2744" align="center" style="padding:8px 3px"><img src="{{ .SiteURL }}/img/pcec-logo-white.png" width="76" height="46" alt="PCEC" style="display:block;border:0;color:#ffffff;font:700 19px Georgia,serif"></td><td style="padding-left:18px"><p style="margin:0;font:700 18px Arial,sans-serif;letter-spacing:.2px;color:#1a2744">PCEC Connect</p><p style="margin:5px 0 0;font:12px/1.5 Arial,sans-serif;color:#666b72">Philippine Council of<br>Evangelical Churches</p></td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:35px 44px 32px">
<p style="margin:0 0 16px;font:700 10px/1.5 Arial,sans-serif;letter-spacing:1.8px;color:#a16610">${m.category}</p>
<h1 class="email-title" style="margin:0 0 24px;font:400 38px/1.15 Georgia,'Times New Roman',serif;letter-spacing:-.7px;color:#1a2744">${m.title}</h1>
<p style="margin:0 0 18px;font:15px/1.75 Arial,sans-serif;color:#424b5a">${m.intro}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border-top:1px solid #e8e4dd;border-bottom:1px solid #e8e4dd"><tr><td style="padding:12px 0;font:12px Arial,sans-serif;color:#747985">ACCOUNT</td><td align="right" style="padding:12px 0 12px 16px;font:13px/1.5 Arial,sans-serif;color:#1a2744;word-break:break-all">{{ .Email }}</td></tr></table>
<p style="margin:0;font:15px/1.75 Arial,sans-serif;color:#424b5a">${m.detail}</p>
${action}
<p style="margin:0;padding-left:14px;border-left:2px solid #cf861c;font:13px/1.7 Arial,sans-serif;color:#5d626d">${m.note}</p>
${!m.destination && !m.code ? '<p style="margin:17px 0 0;font:12px/1.7 Arial,sans-serif;color:#747985">Use the latest email. If the link no longer works, request a new one from the sign-in page.</p>' : ''}
${fallback}
</td></tr><tr><td class="email-pad" style="padding:23px 44px;background:#f7f5f0;border-top:1px solid #e8e4dd"><p style="margin:0 0 7px;font:700 12px Arial,sans-serif;color:#1a2744">A note from PCEC Connect</p><p style="margin:0;font:12px/1.75 Arial,sans-serif;color:#696e78">PCEC will never ask you to reply with your password or verification code. For assistance, reach the PCEC office through the <a href="https://pcec.org.ph" style="color:#1a2744;text-decoration:underline">official PCEC website</a>.</p></td></tr>
</table><p style="margin:18px 0 0;font:11px/1.7 Arial,sans-serif;color:#737781">Philippine Council of Evangelical Churches<br>This account message was sent by PCEC Connect.</p>
</td></tr></table></body></html>\n`;
}

const manifest=[];
for(const m of messages){
  const html=email(m);
  await writeFile(join(out,m.id+'.html'),html);
  manifest.push({...m,html});
}
await writeFile(join(out,'subjects.json'),JSON.stringify(messages.map(({id,subject,slot})=>({file:id+'.html',subject,template:slot})),null,2)+'\n');
const previewShell=await readFile(join(root,'scripts','email-preview-shell.html'),'utf8');
await writeFile(join(root,'email-preview.html'),previewShell.replace('/*__EMAIL_DATA__*/',JSON.stringify(manifest).replaceAll('<','\\u003c')));
console.log(`Built ${manifest.length} PCEC email templates and their preview.`);
