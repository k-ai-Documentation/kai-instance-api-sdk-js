import { KaiInstanceApi } from './index';

const api = new KaiInstanceApi({
  instanceId: 'YOUR_INSTANCE_ID',
  apiKey: 'YOUR_API_KEY',
});

api.document().listDocuments(0, 5).then(docs => {
  console.log(docs);
});
