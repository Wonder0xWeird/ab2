import mongoose, { Model } from 'mongoose';
import conceptSchema, { IConcept } from '../schemas/concept.schema';

const Concept: Model<IConcept> =
  mongoose.models.Concept || mongoose.model<IConcept>('Concept', conceptSchema);

export default Concept; 