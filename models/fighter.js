import mongoose from 'mongoose';

const fighterSchema = new mongoose.Schema({
    name: String,
    record: String,
    weightClass: String,
    style: String,
    image: String,
    flag: String,
    accomplishments: [String]
});

const Fighter = mongoose.model('Fighter', fighterSchema);
export default Fighter;