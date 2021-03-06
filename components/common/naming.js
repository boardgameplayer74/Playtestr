// quick way to capitalize the first letter of a word
export function capitalizeFirstLetter(s){
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// capitalizes words/phrases in wordList preent in keyWords list
export function capitalizeWordListByKey(wordList,keyWords,found=true){
  if(!Array.isArray(wordList) || !Array.isArray(keyWords)) return [];

  // capitalizes the words/phrases in worldList present in keyWords
  let inCommon = wordList.map((word)=>{
    if (found) return keyWords.includes(word) ? word.toUpperCase() : word;
    return keyWords.includes(word) ? word : word.toUpperCase();
  });
  
  return inCommon;
}

// converts a snake_case_phrase (like for DBs) into a camelCasePhrase, like for javascript
export function snakeToCamel(s){
  if (typeof s !== 'string') return '';
  let words = s.split('_');
  let foo = words.map((word,index) => {
    if (index==0) return word;
    return capitalizeFirstLetter(word);
  });
  return foo.join();
}

// converts a camelCasePhrase to a snake_case_phrase
export function camelToSnake(s){
  if (typeof s !== 'string') return '';
  let len = s.length;
  let phrase = '';
  for (let i=0;i<len;i++) {
    if (s.charAt(i)!==s.charAt(i).toLowerCase()) phrase += "_";
    phrase += s.charAt(i);
  }
  return phrase;
}

// converts camel case into title format
export function camelToTitle(s){
  if (typeof s !== 'string') return '';

  // lets start by snake casing it
  let phrase = camelToSnake(s);
  let words = phrase.split('_').map(word => capitalizeFirstLetter(word));
  return words.join(' ');
}

// this formats comma seprated phrases into cleaner text
export function phraseFormatter(s){
  // remove excess internal whitespace
  s = s.replace(/\s\s+/g, ' ');

  // remove unnacceptable characters
  s = s.replace(/[|;$%@"<>()+,]/g, "");

  // capitalize only first letters
  let final = s.split(' ').map(word => capitalizeFirstLetter(word.toLowerCase())).join(' ');

  return final;
}

// formats a comma-separated list of phrases using the phrase formatter
export function phraseListFormatter(s){
  // split it into trimmed, comma-separated phrases
  let phrases = s.split(',').map(phrase => phrase.trim());
  
  return phrases.map(phrase => phraseFormatter(phrase));
}