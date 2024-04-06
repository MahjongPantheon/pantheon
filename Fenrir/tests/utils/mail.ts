export const getLastMail = async () => {
  return (
    await fetch(process.env.HERMOD_URL, {
      method: 'POST',
      body: 'actionkey=j894fjofkqd9-83oph98y32y98fhoe&dump=true',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  ).text();
};
