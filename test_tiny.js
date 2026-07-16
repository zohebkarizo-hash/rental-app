fetch('https://tinyurl.com/26xa5wmw', { redirect: 'manual' })
  .then(res => console.log(res.headers.get('location')))
  .catch(console.error);
