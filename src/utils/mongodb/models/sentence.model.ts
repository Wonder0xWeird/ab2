import mongoose, { Model } from 'mongoose';
import sentenceSchema, { ISentence } from '../schemas/sentence.schema';

const Sentence: Model<ISentence> =
  mongoose.models.Sentence ||
  mongoose.model<ISentence>('Sentence', sentenceSchema);

export default Sentence; 