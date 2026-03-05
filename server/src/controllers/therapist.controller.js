const { Appointment, APPOINTMENT_TYPES, APPOINTMENT_STATUS } = require('../models/Appointment');
const { getUnreadCount } = require('../utils/notification');

/**
 * Get high-level dashboard stats for the authenticated therapist.
 * Uses role-based access via auth middleware (restrictTo('therapist')).
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const therapistId = req.user._id;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const baseFilter = {
      professional: therapistId,
      professionalRole: 'therapist',
      appointmentType: APPOINTMENT_TYPES.THERAPY,
    };

    const [
      assignedChildrenAgg,
      todaysSessionsCount,
      pendingProgressUpdates,
      unreadMessagesCount,
    ] = await Promise.all([
      // Unique children across this therapist's therapy appointments
      Appointment.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$child' } },
        { $count: 'count' },
      ]),
      // Today's sessions (approved / rescheduled / completed on today's date)
      Appointment.countDocuments({
        ...baseFilter,
        status: {
          $in: [
            APPOINTMENT_STATUS.APPROVED,
            APPOINTMENT_STATUS.RESCHEDULED,
            APPOINTMENT_STATUS.COMPLETED,
          ],
        },
        $or: [
          { finalDate: { $gte: startOfDay, $lt: endOfDay } },
          {
            finalDate: null,
            preferredDate: { $gte: startOfDay, $lt: endOfDay },
          },
        ],
      }),
      // Completed sessions with no completionNotes → pending progress updates
      Appointment.countDocuments({
        ...baseFilter,
        status: APPOINTMENT_STATUS.COMPLETED,
        $or: [
          { completionNotes: { $exists: false } },
          { completionNotes: { $eq: '' } },
        ],
      }),
      // Unread notifications for this therapist (used as "unread messages")
      getUnreadCount(therapistId.toString()),
    ]);

    const assignedChildrenCount =
      Array.isArray(assignedChildrenAgg) && assignedChildrenAgg.length > 0
        ? assignedChildrenAgg[0].count
        : 0;

    res.status(200).json({
      success: true,
      data: {
        assignedChildrenCount,
        todaysSessionsCount,
        pendingProgressUpdates,
        unreadMessagesCount,
      },
    });
  } catch (error) {
    console.error('Error fetching therapist dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch therapist dashboard stats',
    });
  }
};

