import Notes from '../models/Notes.js';

// Hilfsfunktion für Filter und Sortierung
const buildQuery = (userId, query) => {
  const filter = { user: userId };
  if (query.completed !== undefined) filter.completed = query.completed === 'true';
  if (query.priority) filter.priority = query.priority;
  if (query.dueDateBefore) filter.dueDate = { ...filter.dueDate, $lte: new Date(query.dueDateBefore) };
  if (query.dueDateAfter) filter.dueDate = { ...filter.dueDate, $gte: new Date(query.dueDateAfter) };
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }
  return filter;
};

const buildSort = (sortBy) => {
  if (!sortBy) return { createdAt: -1 };
  const [field, order] = sortBy.split(':');
  return { [field]: order === 'asc' ? 1 : -1 };
};

export const createNote = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const note = await Notes.create({
      user: req.user._id,
      title,
      description,
      priority,
      dueDate,
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

export const getNotes = async (req, res, next) => {
  try {
    const filter = buildQuery(req.user._id, req.query);
    const sort = buildSort(req.query.sortBy);
    // Spezialfall: Sortierung nach priority
    if (req.query.sortBy && req.query.sortBy.startsWith('priority')) {
      const order = req.query.sortBy.endsWith(':asc') ? 1 : -1;
      const notes = await Notes.aggregate([
        { $match: filter },
        { $addFields: {
            priorityOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'high'] }, then: 3 },
                  { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'low'] }, then: 1 },
                ],
                default: 0
              }
            }
          }
        },
        { $sort: { priorityOrder: order, createdAt: -1 } },
      ]);
      return res.json(notes);
    }
    // Standardfall
    const notes = await Notes.find(filter).sort(sort);
    res.json(notes);
  } catch (err) {
    next(err);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const note = await Notes.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Notiz nicht gefunden.' });
    res.json(note);
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await Notes.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Notiz nicht gefunden.' });
    res.json(note);
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Notes.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Notiz nicht gefunden.' });
    res.json({ message: 'Notiz gelöscht.' });
  } catch (err) {
    next(err);
  }
}; 