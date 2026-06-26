const fs = require('fs');
fetch('https://api.kolektix.my.id/api/shuttle-order')
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data && data.data.data.length > 0) {
      console.log(Object.keys(data.data.data[0]));
    }
  })
  .catch(console.error);
