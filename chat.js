let data = {
  count: 0,
  messages: []
}

const setMessage = ({ message, userName }) => {
  data.count += 1;
  data.messages.push({ message, userName })
  if (data.messages.length > 20) {
    data.messages.splice(0, data.messages.length - 20);
  }
}

const getData = () => data;

module.exports = {
  setMessage,
  getData,
}