import { Scout9File } from '@scout9/admin';
import { Configuration, PocketScoutApi } from '@scout9/admin/src';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { ILocalCache, loadCache, reset, saveCache } from './_utils';

const configuration = new Configuration({
  apiKey: process.env.MY_S9_API_KEY, // Replace with your API key
});
const pocketScout = new PocketScoutApi(configuration);


/**
 * Register yourself as an agent with sample conversations and audio
 */
async function registerAgentWithSamples(cache: ILocalCache) {

  console.log(`Register agent with samples...`);


  const {id: agentId} = await pocketScout.agentRegister({
    firstName: 'Tony',
    lastName: 'Sopranos',

    // Must provide one of the following...
    forwardPhone: '+15555555544', // my personal phone number to get notified of in coming messages
    forwardEmail: 'tonyboss@gmail.com', // my personal email to get notified of in coming messages

    /**
     * (optional) either a provided Scout9 phone number or your personal
     * If a personal number, you'll be asked to download the Pocket Scout app to enable Pocket Scout auto responses
     */
    programmablePhoneNumber: '+15555555555',

    /**
     * (optional) either a provided Scout9 email or your personal
     * If a personal email, you'll be asked to authenticate your Pocket Scout onto your email account
     */
    programmableEmail: `tonyboss@gmail.com`,

    // A brief description of yourself to set the tone
    context: 'I\'m Tony. Look, this life, it ain\'t for the faint-hearted. I got responsibilities - to my family and my crew. Loyalty, respect, that\'s everything. When I deal with my associates, I\'m direct. I expect them to come to me straight, no BS. Some might call me tough, even ruthless, but it\'s the world we\'re in. You show weakness, you\'re done. I\'ve got a code, though. If you\'re loyal to me, I\'ll have your back. But cross me? That\'s something you\'ll regret. It\'s business, but it\'s also personal. We\'re a family.',
  });
  console.log(`Registered agent with id: ${agentId}`);


  // Create a conversation with Chris in the S9 conversation .txt format
  const conversation = `Motivate Soldier, January 15, 2001
Chris: "T, I gotta talk to you about the job."
Tony: "What happened, Chris? It was supposed to be done."
Chris: "Look, I tried, alright? But something went wrong, and I got spooked. I don’t think I can go through with it."
Tony: "Christopher, this ain't just another job. This is our livelihood. Our reputation's on the line."
Chris: "I know, T. But this one... it's different. I got this gut feeling, like it's gonna end badly."
Tony: "Chris, we all get scared. I've had my moments too. But it's about pushing through. It's what we do. It's who we are."
Chris: "I just don't know if I have it in me this time."
Tony: "Listen to me. You're like a son to me. I believe in you, even when you don't believe in yourself. Sometimes, you just need a little push. You got this. Do it for the family, for us."
Chris: "Alright, T. I'll give it another shot. But if it feels off..."
Tony: "Trust your instincts, but also know that fear's part of the game. Overcome it, and you'll come out stronger."`;
  await fs.writeFile(path.resolve(__dirname, './samples/motivate-chris.txt'), conversation);

  const localConversationFiles: [Buffer, string][] = [
    [await fs.readFile(path.resolve(__dirname, './samples/motivate-chris.txt')), 'Conversation with Chris'],
    [await fs.readFile(path.resolve(__dirname, './samples/motivate-paulie.txt')), 'Conversation with Paulie'],
  ];
  const localAudioFiles: [Buffer, string][] = [
    [
      await fs.readFile(path.resolve(__dirname, './samples/tony_audio.mp3')),
      'Secret Audio of me talking to Dr. Melfi (no one can know about this)'
    ],
  ];

  const conversationFiles: Scout9File[] = [];
  for (const [localFile, purpose] of localConversationFiles) {
    conversationFiles.push(await pocketScout.fileCreate(localFile, purpose).then(res => res.data));
  }

  const audioFiles: Scout9File[] = [];
  for (const [localFile, purpose] of localAudioFiles) {
    audioFiles.push(await pocketScout.fileCreate(localFile, purpose).then(res => res.data));
  }

  // Save the conversation and audio files to the agent
  await pocketScout.agentUpdate({
    $id: agentId,
    conversations: conversationFiles.map(({id}) => id),
    audio: audioFiles.map(({id}) => id),
  });

  await saveCache({agent: agentId, files: [...conversationFiles.map(f => f.id), ...audioFiles.map(f => f.id)]});

}

// Load cache for demo purposes (not required)
loadCache()
  .then((cache) => reset(cache, pocketScout))
  .then(registerAgentWithSamples)
  .then(() => console.log('Done! 🎉'))
  .catch((err) => {
    console.error(err);
  });
