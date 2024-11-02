export const statusToText = (status) => {
  switch (status.status) {
    case 'waiting':
      return '⏳';
    case 'pending':
      if (status.lastToken.length === 0) return '⚡';
      return `⚡ ${status.lastToken.replace(/\n/g, ' ')}`;
    case 'done':
      return '✅';
    case 'retrying':
      return '🔁';
    case 'error':
      return '❌ ' + status.message;
  }
};
