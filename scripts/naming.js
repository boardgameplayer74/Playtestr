// quick way to capitalize the first letter of a word
export function capitalize(s){
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// converts a snake_case_phrase (like for DBs) into a camelCasePhrase, like for javascript
export function snakeToCamel(s){
  if (typeof s !== 'string') return '';
  let words = s.split('_');
  let foo = words.map((word,index) => {
    if (index==0) return word;
    return capitalize(word);
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

// this formats comma seprated phrases into cleaner text
export function phraseFormatter(s){
  // split it into trimmed, comma-separated phrases
  let phrases = s.split(',').map(phrase => phrase.trim());

  return phrases.map(phrase => {
    // remove excess internal whitespace
    phrase = phrase.replace(/\s\s+/g, ' ');

    // remove unnacceptable characters
    phrase = phrase.replace(/[|;$%@"<>()+]/g, "");

    // capitalize only first letters
    let final = phrase.split(' ').map(word => capitalize(word.toLowerCase())).join(' ');

    return final;
  });
}