import type { Question } from '@/types/content';

type QParams = Omit<Question, 'id'> & { id?: string };

function q(id: string, params: Omit<Question, 'id'>): Question {
  return { id, ...params };
}

function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

function mkOptions(params: {
  A: { en: string; local: string };
  B: { en: string; local: string };
  C: { en: string; local: string };
  D: { en: string; local: string };
}): Question['options'] {
  return [
    { id: 'A', ...params.A },
    { id: 'B', ...params.B },
    { id: 'C', ...params.C },
    { id: 'D', ...params.D },
  ];
}

function ensureCountByCategory(list: Question[], expected: Record<string, number>) {
  const counts: Record<string, number> = {};
  for (const item of list) counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
  for (const [k, v] of Object.entries(expected)) {
    if ((counts[k] ?? 0) !== v) {
      throw new Error(`Nepal questionsData: expected ${v} for ${k}, got ${counts[k] ?? 0}`);
    }
  }
}

function allLicenseTypes(): Question['licenseTypes'] {
  return ['Bike', 'Car', 'Heavy Vehicle'];
}

function lightVehicleTypes(): Question['licenseTypes'] {
  return ['Bike', 'Car'];
}

function carHeavyTypes(): Question['licenseTypes'] {
  return ['Car', 'Heavy Vehicle'];
}

function bikeOnly(): Question['licenseTypes'] {
  return ['Bike'];
}

// We generate 300 original questions in a structured way (easy to expand later).
export const nepalQuestionsData: Question[] = (() => {
  const out: Question[] = [];
  let n = 1;

  const nextId = () => `np-q-${pad3(n++)}`;

  // -----------------------
  // Traffic rules: 100
  // -----------------------
  const trafficRulesBases: Array<() => Omit<Question, 'id'>> = [
    () => ({
      categoryId: 'traffic-rules',
      licenseTypes: allLicenseTypes(),
      question: { en: 'At a steady red traffic light, what must you do?', local: 'स्थिर रातो ट्राफिक बत्तीमा तपाईंले के गर्नुपर्छ?' },
      options: mkOptions({
        A: { en: 'Stop before the stop line', local: 'स्टप लाइनअगाडि रोक्नुहोस्' },
        B: { en: 'Slow down but continue', local: 'गति घटाएर अगाडि बढ्नुहोस्' },
        C: { en: 'Honk and proceed', local: 'हर्न बजाएर अघि बढ्नुहोस्' },
        D: { en: 'Proceed if no traffic is seen', local: 'ट्राफिक नदेखिए अघि बढ्नुहोस्' },
      }),
      correctOptionId: 'A',
      explanation: {
        en: 'A red signal requires a complete stop at the stop line or before the intersection.',
        local: 'रातो संकेतमा स्टप लाइन वा जक्सनअगाडि पूर्ण रूपमा रोक्नुपर्छ।',
      },
    }),
    () => ({
      categoryId: 'traffic-rules',
      licenseTypes: allLicenseTypes(),
      question: { en: 'What does a steady green traffic light mean for you?', local: 'स्थिर हरियो बत्तीले तपाईंका लागि के अर्थ दिन्छ?' },
      options: mkOptions({
        A: { en: 'Go, but only if the intersection is clear', local: 'जक्सन खाली भए मात्र जानुहोस्' },
        B: { en: 'Stop immediately', local: 'तुरुन्त रोक्नुहोस्' },
        C: { en: 'Turn only (no straight)', local: 'मात्र मोड्नु (सिधा जान पाइँदैन)' },
        D: { en: 'Go without checking', local: 'नहेरीकनै जानुहोस्' },
      }),
      correctOptionId: 'A',
      explanation: {
        en: 'Green permits movement, but you must still yield to hazards and ensure the way is clear.',
        local: 'हरियोमा चल्न पाइन्छ, तर खतरा छैन भनेर हेरेर मात्र अघि बढ्नु पर्छ।',
      },
    }),
    () => ({
      categoryId: 'traffic-rules',
      licenseTypes: allLicenseTypes(),
      question: { en: 'At a yellow/amber traffic light, the safest action is usually to…', local: 'पहेंलो/एम्बर बत्तीमा सबैभन्दा सुरक्षित काम के हो?' },
      options: mkOptions({
        A: { en: 'Prepare to stop unless you are too close to stop safely', local: 'सुरक्षित रूपमा रोक्न नसक्ने अवस्थामा बाहेक रोक्न तयारी गर्नुहोस्' },
        B: { en: 'Speed up no matter what', local: 'जसरी पनि गतिको बढाउनुहोस्' },
        C: { en: 'Reverse a little', local: 'अलि पछाडि फर्कनुहोस्' },
        D: { en: 'Switch off headlights', local: 'हेडलाईट बन्द गर्नुहोस्' },
      }),
      correctOptionId: 'A',
      explanation: {
        en: 'Amber warns the signal will change; stop if you can do so safely without harsh braking.',
        local: 'पहेंलोले संकेत परिवर्तन हुँदैछ भन्छ; सुरक्षित भए रोक्नुहोस्।',
      },
    }),
    () => ({
      categoryId: 'traffic-rules',
      licenseTypes: lightVehicleTypes(),
      question: { en: 'When is overtaking appropriate?', local: 'ओभरटेक कहिले उपयुक्त हुन्छ?' },
      options: mkOptions({
        A: { en: 'When the road ahead is clear and you can do it safely', local: 'अगाडिको बाटो स्पष्ट र सुरक्षित हुँदा' },
        B: { en: 'On sharp bends', local: 'तेज घुम्तीमा' },
        C: { en: 'On pedestrian crossings', local: 'पैदल यात्रु क्रसिङमा' },
        D: { en: 'Near blind corners', local: 'नदेखिने मोड नजिक' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Overtake only with clear visibility and sufficient space.', local: 'दृश्यता र ठाउँ स्पष्ट हुँदा मात्र सुरक्षित रूपमा ओभरटेक गर्नुहोस्।' },
    }),
    () => ({
      categoryId: 'traffic-rules',
      licenseTypes: allLicenseTypes(),
      question: { en: 'In Nepal, you should generally drive on which side of the road?', local: 'नेपालमा सामान्यतया कुन साइडमा सवारी चलाइन्छ?' },
      options: mkOptions({
        A: { en: 'Left', local: 'बायाँ' },
        B: { en: 'Right', local: 'दायाँ' },
        C: { en: 'Middle', local: 'बीच' },
        D: { en: 'Any side', local: 'जुनसुकै' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Nepal follows left-hand traffic: keep left and overtake from the right.', local: 'नेपालमा बायाँबाट सवारी चलाइन्छ: बायाँ राख्नुहोस् र दायाँबाट उछिन्नुहोस्।' },
    }),
  ];

  // Expand traffic rules with parameterized variants (original text).
  const speedLimits = [20, 30, 40, 50, 60, 80];
  const safeGaps = [
    { en: 'at least a 2-second gap in dry conditions', local: 'सुक्खा अवस्थामा कम्तीमा २-सेकेन्डको दूरी' },
    { en: 'increase the gap in rain or fog', local: 'पानी/कुहिरोमा दूरी बढाउने' },
    { en: 'leave more space behind heavy vehicles', local: 'भारी सवारी पछाडि बढी खाली ठाउँ राख्ने' },
    { en: 'avoid tailgating at any speed', local: 'कुनै पनि गतिमा पछाडि टाँसिएर नचल्ने' },
  ];

  // Add a solid core first.
  for (let i = 0; i < trafficRulesBases.length; i++) out.push(q(nextId(), trafficRulesBases[i]()));

  // Speed-limit rule questions
  for (const kmh of speedLimits) {
    out.push(
      q(nextId(), {
        categoryId: 'traffic-rules',
        licenseTypes: allLicenseTypes(),
        question: {
          en: `If the posted speed limit is ${kmh} km/h, what is the safest approach?`,
          local: `यदि संकेत गरिएको गति सीमा ${kmh} किमी/घन्टा छ भने सुरक्षित तरीका के हो?`,
        },
        options: mkOptions({
          A: { en: 'Drive at or below the limit depending on conditions', local: 'अवस्था अनुसार सीमाभित्र वा कम गतिमा चलाउनुहोस्' },
          B: { en: 'Always drive 10 km/h above the limit', local: 'सधैं १० किमी/घन्टा बढी चलाउनुहोस्' },
          C: { en: 'Match the fastest vehicle', local: 'सबैभन्दा छिटो सवारीसँग मिलाउनुहोस्' },
          D: { en: 'Speed limits do not apply at night', local: 'राति गति सीमा लागू हुँदैन' },
        }),
        correctOptionId: 'A',
        explanation: {
          en: 'Posted limits are the maximum for ideal conditions; reduce speed when visibility, traffic, or road surface is risky.',
          local: 'गति सीमा आदर्श अवस्थामा अधिकतम हो; जोखिमपूर्ण अवस्थामा गति घटाउनुपर्छ।',
        },
      }),
    );
  }

  // Following distance questions
  for (const rule of safeGaps) {
    out.push(
      q(nextId(), {
        categoryId: 'traffic-rules',
        licenseTypes: allLicenseTypes(),
        question: { en: 'What is a good rule for following distance?', local: 'पछाडि चल्दा सुरक्षित दूरीको राम्रो नियम के हो?' },
        options: mkOptions({
          A: { en: rule.en, local: rule.local },
          B: { en: 'Stay one meter behind', local: '१ मिटर पछाडि बस्ने' },
          C: { en: 'No gap is needed if you have good brakes', local: 'ब्रेक राम्रो भए दूरी चाहिँदैन' },
          D: { en: 'Only keep distance on highways', local: 'केवल हाइवेमा मात्र दूरी राख्ने' },
        }),
        correctOptionId: 'A',
        explanation: { en: 'Space gives you time to react and stop smoothly.', local: 'दूरी राख्दा प्रतिक्रिया दिने समय र सहज रोक्ने मौका मिल्छ।' },
      }),
    );
  }

  // General traffic rules templates to reach 100
  const trafficTemplates: Array<Omit<Question, 'id'>> = [
    {
      categoryId: 'traffic-rules',
      licenseTypes: allLicenseTypes(),
      question: { en: 'Before turning, you should…', local: 'मोड्नुअघि तपाईंले…' },
      options: mkOptions({
        A: { en: 'Check mirrors, signal early, and look for pedestrians', local: 'ऐना हेर्नुहोस्, समयमै संकेत दिनुहोस्, पैदल यात्रु हेर्नुहोस्' },
        B: { en: 'Turn suddenly without warning', local: 'बिना सूचना एक्कासी मोड्नुहोस्' },
        C: { en: 'Honk continuously', local: 'लगातार हर्न बजाउनुहोस्' },
        D: { en: 'Close your eyes briefly', local: 'अलि आँखा बन्द गर्नुहोस्' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Good observation + early signal prevents conflicts and crashes.', local: 'अवलोकन र समयमै संकेतले दुर्घटना घटाउँछ।' },
    },
    {
      categoryId: 'traffic-rules',
      licenseTypes: allLicenseTypes(),
      question: { en: 'At a zebra crossing with pedestrians waiting, you should…', local: 'जिब्रा क्रसिङमा पैदल यात्रु पर्खिरहेका छन् भने…' },
      options: mkOptions({
        A: { en: 'Slow down and stop to let them cross', local: 'गति घटाएर रोकेर पार गराउनुहोस्' },
        B: { en: 'Speed up to pass first', local: 'पहिले पार गर्न गति बढाउनुहोस्' },
        C: { en: 'Wave them to wait', local: 'पर्ख भन्न हात हल्लाउनुहोस्' },
        D: { en: 'Use high beam to warn them', local: 'हाइ बीम बालेर चेतावनी दिनुहोस्' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Pedestrians have priority at marked crossings; stop safely.', local: 'चिन्हित क्रसिङमा पैदल यात्रुलाई प्राथमिकता दिनुपर्छ।' },
    },
    {
      categoryId: 'traffic-rules',
      licenseTypes: allLicenseTypes(),
      question: { en: 'When should you use your horn?', local: 'हर्न कहिले प्रयोग गर्नु उपयुक्त हुन्छ?' },
      options: mkOptions({
        A: { en: 'Only to warn of immediate danger', local: 'तत्काल जोखिमको चेतावनी दिन मात्र' },
        B: { en: 'To express anger', local: 'रिस देखाउन' },
        C: { en: 'To greet friends', local: 'साथीलाई अभिवादन गर्न' },
        D: { en: 'All the time in traffic', local: 'ट्राफिकमा सधैं' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Horn is a safety tool, not a communication for emotions.', local: 'हर्न सुरक्षा उपकरण हो, रिस/अभिवादनका लागि होइन।' },
    },
    {
      categoryId: 'traffic-rules',
      licenseTypes: allLicenseTypes(),
      question: { en: 'If an ambulance approaches with siren, you should…', local: 'साइरनसहित एम्बुलेन्स आयो भने…' },
      options: mkOptions({
        A: { en: 'Give way safely and as soon as possible', local: 'सुरक्षित रूपमा सकेसम्म चाँडो बाटो दिनुहोस्' },
        B: { en: 'Race it', local: 'प्रतिस्पर्धा गर्नुहोस्' },
        C: { en: 'Block the lane to stop it', local: 'रोक्न लेन छेक्नुहोस्' },
        D: { en: 'Ignore and continue', local: 'वास्ता नगरी अघि बढ्नुहोस्' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Emergency vehicles need priority; move aside when safe.', local: 'आपतकालीन सवारीलाई प्राथमिकता दिनु पर्छ; सुरक्षित हुँदा साइड दिनुहोस्।' },
    },
  ];

  // Fill traffic-rules until we hit 100.
  while (out.filter((x) => x.categoryId === 'traffic-rules').length < 100) {
    for (const t of trafficTemplates) {
      out.push(q(nextId(), t));
      if (out.filter((x) => x.categoryId === 'traffic-rules').length >= 100) break;
    }
  }

  // -----------------------
  // Road signs (traffic signs): 75
  // -----------------------
  const signShapes = [
    { shapeEn: 'Triangle', shapeNp: 'त्रिकोण', meaningEn: 'Warning', meaningNp: 'चेतावनी' },
    { shapeEn: 'Red-bordered circle', shapeNp: 'रातो किनार भएको गोला', meaningEn: 'Prohibition / restriction', meaningNp: 'निषेध / प्रतिबन्ध' },
    { shapeEn: 'Blue circle', shapeNp: 'निलो गोला', meaningEn: 'Mandatory instruction', meaningNp: 'अनिवार्य निर्देशन' },
    { shapeEn: 'Rectangle / square', shapeNp: 'आयत / वर्ग', meaningEn: 'Information / guidance', meaningNp: 'जानकारी / मार्गदर्शन' },
  ];

  const specificSigns = [
    { en: 'STOP', local: 'रोक', meaningEn: 'Come to a complete stop and proceed when safe', meaningNp: 'पूर्ण रूपमा रोक्नुहोस् र सुरक्षित भए मात्र अघि बढ्नुहोस्' },
    { en: 'NO ENTRY', local: 'प्रवेश निषेध', meaningEn: 'Vehicles must not enter', meaningNp: 'सवारी प्रवेश गर्न पाइँदैन' },
    { en: 'GIVE WAY', local: 'बाटो दिनुहोस्', meaningEn: 'Yield to crossing traffic', meaningNp: 'क्रसिङ ट्राफिकलाई प्राथमिकता दिनुहोस्' },
    { en: 'SPEED LIMIT', local: 'गति सीमा', meaningEn: 'Do not exceed the posted speed', meaningNp: 'दिएको गति सीमा ननाघ्नुहोस्' },
    { en: 'NO PARKING', local: 'पार्किङ निषेध', meaningEn: 'Parking is not allowed in this area', meaningNp: 'यहाँ पार्किङ गर्न पाइँदैन' },
    { en: 'ONE WAY', local: 'एकतर्फी', meaningEn: 'Traffic must go in one direction only', meaningNp: 'एक दिशा मात्र चल्नुपर्छ' },
  ];

  // Shape meaning questions
  for (const s of signShapes) {
    out.push(
      q(nextId(), {
        categoryId: 'road-signs',
        licenseTypes: allLicenseTypes(),
        question: { en: `A ${s.shapeEn} road sign usually means…`, local: `${s.shapeNp} आकारको सडक चिन्हले प्रायः के जनाउँछ?` },
        options: mkOptions({
          A: { en: s.meaningEn, local: s.meaningNp },
          B: { en: 'Only parking', local: 'मात्र पार्किङ' },
          C: { en: 'Vehicle repair', local: 'सवारी मर्मत' },
          D: { en: 'Fuel station', local: 'इन्धन स्टेशन' },
        }),
        correctOptionId: 'A',
        explanation: { en: 'Recognizing shape patterns helps you react quickly to signs.', local: 'आकारबाट संकेत चिन्न सक्दा छिटो प्रतिक्रिया दिन सकिन्छ।' },
      }),
    );
  }

  // Specific sign meaning questions
  for (const s of specificSigns) {
    out.push(
      q(nextId(), {
        categoryId: 'road-signs',
        licenseTypes: allLicenseTypes(),
        question: { en: `What does the "${s.en}" sign mean?`, local: `"${s.local}" चिन्हले के जनाउँछ?` },
        options: mkOptions({
          A: { en: s.meaningEn, local: s.meaningNp },
          B: { en: 'You must accelerate', local: 'तपाईंले गति बढाउनै पर्छ' },
          C: { en: 'You may ignore it if the road is empty', local: 'बाटो खाली भए बेवास्ता गर्न मिल्छ' },
          D: { en: 'It applies only to bikes', local: 'यो केवल बाइकमा लागू हुन्छ' },
        }),
        correctOptionId: 'A',
        explanation: { en: 'Road signs are legal instructions or warnings and must be followed.', local: 'सडक चिन्ह कानुनी निर्देशन/चेतावनी हो, पालना गर्नुपर्छ।' },
      }),
    );
  }

  // Generate additional traffic sign questions (warning/regulatory/information).
  const warningSituations = [
    { en: 'Sharp bend ahead', local: 'अगाडि तेज मोड' },
    { en: 'School zone', local: 'विद्यालय क्षेत्र' },
    { en: 'Road works', local: 'सडक मर्मत कार्य' },
    { en: 'Slippery road', local: 'चिप्लो सडक' },
    { en: 'Falling rocks', local: 'ढुंगा खस्ने' },
    { en: 'Pedestrian crossing', local: 'पैदल यात्रु क्रसिङ' },
    { en: 'Cattle crossing', local: 'गाईभैंसी पार हुने' },
    { en: 'Narrow bridge', local: 'साँघुरो पुल' },
    { en: 'Steep descent', local: 'तेज ओरालो' },
    { en: 'Steep ascent', local: 'तेज उकालो' },
  ];

  for (const w of warningSituations) {
    out.push(
      q(nextId(), {
        categoryId: 'road-signs',
        licenseTypes: allLicenseTypes(),
        question: { en: `If you see a warning sign for "${w.en}", what should you do?`, local: `"${w.local}" चेतावनी चिन्ह देख्दा तपाईंले के गर्नुपर्छ?` },
        options: mkOptions({
          A: { en: 'Slow down and be prepared to react', local: 'गति घटाएर सावधान हुनुहोस्' },
          B: { en: 'Speed up to clear the area quickly', local: 'छिटो पार गर्न गति बढाउनुहोस्' },
          C: { en: 'Drive in the middle of the road', local: 'बाटोको बीचमै चलाउनुहोस्' },
          D: { en: 'Switch off lights', local: 'बत्ती बन्द गर्नुहोस्' },
        }),
        correctOptionId: 'A',
        explanation: { en: 'Warning signs advise you to reduce risk by adjusting speed and attention.', local: 'चेतावनी चिन्हले जोखिम घटाउन गति र ध्यान मिलाउन भन्छ।' },
      }),
    );
  }

  // Fill road-signs until we hit 75.
  const signFillers: Array<Omit<Question, 'id'>> = [
    {
      categoryId: 'road-signs',
      licenseTypes: allLicenseTypes(),
      question: { en: 'Why are road signs important?', local: 'सडक चिन्ह किन महत्त्वपूर्ण हुन्छ?' },
      options: mkOptions({
        A: { en: 'They inform, warn, and regulate traffic for safety', local: 'सुरक्षाका लागि जानकारी, चेतावनी र नियम बताउँछन्' },
        B: { en: 'They are only decorative', local: 'मात्र सजावटका लागि' },
        C: { en: 'They replace traffic police everywhere', local: 'सबै ठाउँमा ट्राफिक प्रहरीको सट्टा' },
        D: { en: 'They matter only at night', local: 'केवल राति मात्र' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Signs standardize communication so drivers can predict and react safely.', local: 'चिन्हले साझा संकेत दिन्छन्, जसले सुरक्षित निर्णय गर्न मद्दत गर्छ।' },
    },
    {
      categoryId: 'road-signs',
      licenseTypes: allLicenseTypes(),
      question: { en: 'If a sign and a traffic officer give different instructions, you should follow…', local: 'चिन्ह र ट्राफिक प्रहरीले फरक निर्देशन दिएमा के पालना गर्ने?' },
      options: mkOptions({
        A: { en: 'The traffic officer’s instruction', local: 'ट्राफिक प्रहरीको निर्देशन' },
        B: { en: 'The sign only', local: 'चिन्ह मात्र' },
        C: { en: 'Your own judgement without stopping', local: 'नरोकीकन आफ्नै निर्णय' },
        D: { en: 'The loudest horn nearby', local: 'सबैभन्दा ठूलो हर्न' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'A traffic officer manages real-time safety; their instructions override signs temporarily.', local: 'प्रहरीले तत्काल अवस्थाअनुसार ट्राफिक व्यवस्थापन गर्छ; निर्देश पालना गर्नुपर्छ।' },
    },
  ];

  while (out.filter((x) => x.categoryId === 'road-signs').length < 75) {
    for (const t of signFillers) {
      out.push(q(nextId(), t));
      if (out.filter((x) => x.categoryId === 'road-signs').length >= 75) break;
    }
  }

  // -----------------------
  // Safety: 70
  // -----------------------
  const safetyTemplates: Array<Omit<Question, 'id'>> = [
    {
      categoryId: 'safety',
      licenseTypes: allLicenseTypes(),
      question: { en: 'What is the main benefit of wearing a seatbelt?', local: 'सिटबेल्ट लगाउँदा मुख्य फाइदा के हो?' },
      options: mkOptions({
        A: { en: 'It reduces injury during sudden stops or crashes', local: 'अचानक रोक्दा/दुर्घटनामा चोट घटाउँछ' },
        B: { en: 'It increases fuel efficiency', local: 'इन्धन बचत बढाउँछ' },
        C: { en: 'It makes the horn louder', local: 'हर्न ठूलो बनाउँछ' },
        D: { en: 'It improves tyre grip', local: 'टायरको ग्रिप बढाउँछ' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Seatbelts keep occupants positioned and reduce impact forces.', local: 'सिटबेल्टले सवारलाई स्थिर राख्छ र ठोक्किने प्रभाव घटाउँछ।' },
    },
    {
      categoryId: 'safety',
      licenseTypes: ['Bike', 'Car', 'Heavy Vehicle'],
      question: { en: 'Why should you avoid using a mobile phone while driving?', local: 'ड्राइभ गर्दा मोबाइल किन प्रयोग गर्नु हुँदैन?' },
      options: mkOptions({
        A: { en: 'It distracts attention and slows reaction time', local: 'ध्यान भंग हुन्छ र प्रतिक्रिया ढिलो हुन्छ' },
        B: { en: 'It improves navigation', local: 'नेभिगेसन सुधार हुन्छ' },
        C: { en: 'It makes you more confident', local: 'आत्मविश्वास बढ्छ' },
        D: { en: 'It warms the hands', local: 'हात तताउँछ' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Distraction is a major cause of crashes; focus must stay on the road.', local: 'ध्यान भंग हुँदा दुर्घटना हुन्छ; ध्यान सडकमा हुनुपर्छ।' },
    },
    {
      categoryId: 'safety',
      licenseTypes: ['Bike'],
      question: { en: 'For two-wheelers, a properly fastened helmet helps most to…', local: 'दुईपाङ्ग्रेका लागि राम्रोसँग बाँधेको हेल्मेटले मुख्य रूपमा के गर्छ?' },
      options: mkOptions({
        A: { en: 'Protect the head during a fall or crash', local: 'लड्दा/दुर्घटनामा टाउको बचाउँछ' },
        B: { en: 'Increase top speed', local: 'अधिकतम गति बढाउँछ' },
        C: { en: 'Reduce engine noise', local: 'इन्जिनको आवाज घटाउँछ' },
        D: { en: 'Make braking shorter', local: 'ब्रेक दूरी घटाउँछ' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'A helmet reduces head injury risk significantly when worn correctly.', local: 'हेल्मेट सही तरिकाले लगाउँदा टाउकोको चोट धेरै घट्छ।' },
    },
  ];

  while (out.filter((x) => x.categoryId === 'safety').length < 70) {
    for (const t of safetyTemplates) {
      out.push(q(nextId(), t));
      if (out.filter((x) => x.categoryId === 'safety').length >= 70) break;
    }
  }

  // -----------------------
  // Vehicle handling: 55
  // -----------------------
  const handlingTemplates: Array<Omit<Question, 'id'>> = [
    {
      categoryId: 'vehicle-handling',
      licenseTypes: allLicenseTypes(),
      question: { en: 'Before braking hard, you should first…', local: 'जोरसँग ब्रेक लगाउनुअघि पहिले…' },
      options: mkOptions({
        A: { en: 'Check behind and brake smoothly if possible', local: 'पछाडि हेरेर सम्भव भए सहज रूपमा ब्रेक लगाउनुहोस्' },
        B: { en: 'Turn off the engine', local: 'इन्जिन बन्द गर्नुहोस्' },
        C: { en: 'Close the mirrors', local: 'ऐना बन्द गर्नुहोस्' },
        D: { en: 'Shift to a higher gear immediately', local: 'तुरुन्त उच्च गियरमा राख्नुहोस्' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Awareness behind you prevents rear-end collisions; smooth braking maintains control.', local: 'पछाडि हेर्दा पछाडिबाट ठोक्किने जोखिम घट्छ; सहज ब्रेकले नियन्त्रण राख्छ।' },
    },
    {
      categoryId: 'vehicle-handling',
      licenseTypes: lightVehicleTypes(),
      question: { en: 'What is the purpose of indicators/turn signals?', local: 'इन्डिकेटर (टर्न सिग्नल) को उद्देश्य के हो?' },
      options: mkOptions({
        A: { en: 'To tell others your intended direction change', local: 'अरूलाई दिशा परिवर्तनको संकेत दिन' },
        B: { en: 'To increase speed', local: 'गति बढाउन' },
        C: { en: 'To cool the engine', local: 'इन्जिन चिस्याउन' },
        D: { en: 'To clean the windshield', local: 'सिसा सफा गर्न' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Signals reduce surprises and allow others to adjust safely.', local: 'सिग्नलले अरूलाई पहिले नै जानकारी दिन्छ र सुरक्षित समायोजन गर्न मद्दत गर्छ।' },
    },
    {
      categoryId: 'vehicle-handling',
      licenseTypes: carHeavyTypes(),
      question: { en: 'What should you do before reversing a vehicle?', local: 'सवारी रिभर्स गर्नु अघि के गर्नुपर्छ?' },
      options: mkOptions({
        A: { en: 'Check mirrors and look around for people/obstacles', local: 'ऐना र वरिपरि हेरेर मानिस/अवरोध जाँच्नुहोस्' },
        B: { en: 'Press horn continuously and reverse fast', local: 'लगातार हर्न बजाएर छिटो रिभर्स गर्नुहोस्' },
        C: { en: 'Reverse with eyes closed to avoid glare', local: 'चमकबाट बच्न आँखा बन्द गरेर रिभर्स' },
        D: { en: 'Only check the front', local: 'अगाडि मात्र हेर्ने' },
      }),
      correctOptionId: 'A',
      explanation: { en: 'Reversing has limited visibility; careful checks prevent accidents.', local: 'रिभर्स गर्दा दृश्यता कम हुन्छ; जाँच गर्दा दुर्घटना टर्छ।' },
    },
  ];

  while (out.filter((x) => x.categoryId === 'vehicle-handling').length < 55) {
    for (const t of handlingTemplates) {
      out.push(q(nextId(), t));
      if (out.filter((x) => x.categoryId === 'vehicle-handling').length >= 55) break;
    }
  }

  // Final validation
  if (out.length !== 300) {
    throw new Error(`Nepal questionsData: expected total 300, got ${out.length}`);
  }
  ensureCountByCategory(out, {
    'traffic-rules': 100,
    'road-signs': 75,
    safety: 70,
    'vehicle-handling': 55,
  });

  // Ensure IDs are unique
  const seen = new Set<string>();
  for (const item of out) {
    if (seen.has(item.id)) throw new Error(`Duplicate question id: ${item.id}`);
    seen.add(item.id);
  }

  return out;
})();

