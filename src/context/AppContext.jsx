import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  mockUsers,
  initialMentors,
  initialCoordinators,
  initialMentees,
  initialConnections,
  initialSessions,
  initialReviews,
  initialAllocations,
  initialSessionReports,
  initialGoals,
  initialGoalUpdates,
  initialGoalFeedback,
  initialTrimesterReviews,
} from '../data/mockData';

const AppContext = createContext(null);
const AUTH_STORAGE_KEY = 'mentorhub_auth_session';
const COORDINATORS_STORAGE_KEY = 'mentorhub_coordinators';
const MENTORS_STORAGE_KEY = 'mentorhub_mentors';
const MENTEES_STORAGE_KEY = 'mentorhub_mentees';
const CONNECTIONS_STORAGE_KEY = 'mentorhub_connections';
const SESSIONS_STORAGE_KEY = 'mentorhub_sessions';
const REVIEWS_STORAGE_KEY = 'mentorhub_reviews';
const ALLOCATIONS_STORAGE_KEY = 'mentorhub_allocations';
const SESSION_REPORTS_STORAGE_KEY = 'mentorhub_session_reports';
const GOALS_STORAGE_KEY = 'mentorhub_goals';
const GOAL_UPDATES_STORAGE_KEY = 'mentorhub_goal_updates';
const GOAL_FEEDBACK_STORAGE_KEY = 'mentorhub_goal_feedback';
const TRIMESTER_REVIEWS_STORAGE_KEY = 'mentorhub_trimester_reviews';

export function AppProvider({ children }) {
  // ── 1. Centralized Reviews Dataset ──────────────────────────────────────
  const [reviews, setReviews] = useState(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse reviews from localStorage', e);
    }
    return initialReviews;
  });

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Failed to save reviews to localStorage', e);
    }
  }, [reviews]);

  // ── 2. Centralized Mentors Dataset with Dynamic Ratings ─────────────────
  const [mentors, setMentors] = useState(() => {
    try {
      const stored = localStorage.getItem(MENTORS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse mentors from localStorage', e);
    }
    return initialMentors;
  });

  // Keep mentors rating & reviews in sync with reviews dataset
  useEffect(() => {
    setMentors((prevMentors) => {
      let changed = false;
      const updated = prevMentors.map((m) => {
        const mentorRevs = reviews.filter((r) => r.mentorId === m.id);
        const count = mentorRevs.length;
        const avg =
          count > 0
            ? Number((mentorRevs.reduce((acc, r) => acc + Number(r.rating), 0) / count).toFixed(1))
            : 0;

        if (m.rating !== avg || m.totalReviews !== count) {
          changed = true;
          return { ...m, rating: avg, totalReviews: count };
        }
        return m;
      });
      return changed ? updated : prevMentors;
    });
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(MENTORS_STORAGE_KEY, JSON.stringify(mentors));
    } catch (e) {
      console.warn('Failed to save mentors to localStorage', e);
    }
  }, [mentors]);

  // ── 3. Centralized Coordinators Dataset ─────────────────────────────────
  const [coordinators, setCoordinators] = useState(() => {
    try {
      const stored = localStorage.getItem(COORDINATORS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse coordinators from localStorage', e);
    }
    return initialCoordinators;
  });

  useEffect(() => {
    try {
      localStorage.setItem(COORDINATORS_STORAGE_KEY, JSON.stringify(coordinators));
    } catch (e) {
      console.warn('Failed to save coordinators to localStorage', e);
    }
  }, [coordinators]);

  // ── 4. Centralized Mentees Dataset ─────────────────────────────────────
  const [mentees, setMentees] = useState(() => {
    try {
      const stored = localStorage.getItem(MENTEES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse mentees from localStorage', e);
    }
    return initialMentees;
  });

  useEffect(() => {
    try {
      localStorage.setItem(MENTEES_STORAGE_KEY, JSON.stringify(mentees));
    } catch (e) {
      console.warn('Failed to save mentees to localStorage', e);
    }
  }, [mentees]);

  // ── 5. Centralized Connections Dataset ──────────────────────────────────
  const [connections, setConnections] = useState(() => {
    try {
      const stored = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse connections from localStorage', e);
    }
    return initialConnections;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
    } catch (e) {
      console.warn('Failed to save connections to localStorage', e);
    }
  }, [connections]);

  // ── 6. Centralized Sessions Dataset ─────────────────────────────────────
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse sessions from localStorage', e);
    }
    return initialSessions;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage', e);
    }
  }, [sessions]);

  // ── 7. Centralized Allocations Dataset ──────────────────────────────────
  const [allocations, setAllocations] = useState(() => {
    try {
      const stored = localStorage.getItem(ALLOCATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse allocations from localStorage', e);
    }
    return initialAllocations;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(allocations));
    } catch (e) {
      console.warn('Failed to save allocations to localStorage', e);
    }
  }, [allocations]);

  // ── 8. Centralized Session Reports Dataset ───────────────────────────────
  const [sessionReports, setSessionReports] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_REPORTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse session reports from localStorage', e);
    }
    return initialSessionReports;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_REPORTS_STORAGE_KEY, JSON.stringify(sessionReports));
    } catch (e) {
      console.warn('Failed to save session reports to localStorage', e);
    }
  }, [sessionReports]);

  // ── 9. Centralized Goals Dataset ─────────────────────────────────────────
  const [goals, setGoals] = useState(() => {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse goals from localStorage', e);
    }
    return initialGoals;
  });

  useEffect(() => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.warn('Failed to save goals to localStorage', e);
    }
  }, [goals]);

  // ── 10. Centralized Goal Progress Updates Dataset ───────────────────────
  const [goalUpdates, setGoalUpdates] = useState(() => {
    try {
      const stored = localStorage.getItem(GOAL_UPDATES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse goal updates from localStorage', e);
    }
    return initialGoalUpdates;
  });

  useEffect(() => {
    try {
      localStorage.setItem(GOAL_UPDATES_STORAGE_KEY, JSON.stringify(goalUpdates));
    } catch (e) {
      console.warn('Failed to save goal updates to localStorage', e);
    }
  }, [goalUpdates]);

  // ── 11. Centralized Goal Feedback History Dataset ────────────────────────
  const [goalFeedback, setGoalFeedback] = useState(() => {
    try {
      const stored = localStorage.getItem(GOAL_FEEDBACK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse goal feedback from localStorage', e);
    }
    return initialGoalFeedback;
  });

  useEffect(() => {
    try {
      localStorage.setItem(GOAL_FEEDBACK_STORAGE_KEY, JSON.stringify(goalFeedback));
    } catch (e) {
      console.warn('Failed to save goal feedback to localStorage', e);
    }
  }, [goalFeedback]);

  // ── 12. Centralized Trimester Reviews Dataset (Stage 6) ───────────────────
  const [trimesterReviews, setTrimesterReviews] = useState(() => {
    try {
      const stored = localStorage.getItem(TRIMESTER_REVIEWS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse trimester reviews from localStorage', e);
    }
    return initialTrimesterReviews;
  });

  useEffect(() => {
    try {
      localStorage.setItem(TRIMESTER_REVIEWS_STORAGE_KEY, JSON.stringify(trimesterReviews));
    } catch (e) {
      console.warn('Failed to save trimester reviews to localStorage', e);
    }
  }, [trimesterReviews]);

  // Helper to look up any user (mentor, coordinator, mentee, HOD, admin)
  const getUserById = (userId) => {
    const mentor = mentors.find((m) => m.id === userId || m.mentorId === userId);
    if (mentor) return mentor;
    const coord = coordinators.find((c) => c.id === userId);
    if (coord) return coord;
    const mentee = mentees.find((m) => m.id === userId);
    if (mentee) return mentee;
    return mockUsers.find((u) => u.id === userId);
  };

  const resolveUser = (userId, email) => {
    const trimmedEmail = email ? email.toLowerCase() : null;
    const freshMentor = mentors.find(
      (m) => m.id === userId || (trimmedEmail && m.email.toLowerCase() === trimmedEmail)
    );
    if (freshMentor) return freshMentor;

    const freshCoord = coordinators.find(
      (c) => c.id === userId || (trimmedEmail && c.email.toLowerCase() === trimmedEmail)
    );
    if (freshCoord) return freshCoord;

    const freshMentee = mentees.find(
      (m) => m.id === userId || (trimmedEmail && m.email.toLowerCase() === trimmedEmail)
    );
    if (freshMentee) return freshMentee;

    return mockUsers.find(
      (u) => u.id === userId || (trimmedEmail && u.email.toLowerCase() === trimmedEmail)
    );
  };

  // ── 5. Authentication State ─────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const found = resolveUser(parsed.userId, parsed.email);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Failed to parse auth session from localStorage', e);
    }
    return null;
  });

  const [currentRole, setCurrentRoleState] = useState(() => currentUser?.role || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => currentUser !== null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New connection request received', time: '5 min ago', read: false },
    { id: 2, text: 'Upcoming session scheduled for this week', time: '1 hr ago', read: false },
    { id: 3, text: 'Mentor confirmed your session request', time: '3 hr ago', read: true },
    { id: 4, text: 'Monthly cohort report is ready for review', time: 'Yesterday', read: true },
  ]);

  useEffect(() => {
    if (currentUser) {
      setCurrentRoleState(currentUser.role);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ userId: currentUser.id, email: currentUser.email, role: currentUser.role })
        );
      } catch (e) {
        console.warn('Failed to save auth session to localStorage', e);
      }
    } else {
      setCurrentRoleState(null);
      setIsAuthenticated(false);
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {
        console.warn('Failed to remove auth session from localStorage', e);
      }
    }
  }, [currentUser]);

  // ── 6. Mentors Context Methods ──────────────────────────────────────────
  const updateMentorProfile = (mentorId, updatedFields) => {
    setMentors((prevMentors) => {
      const updatedList = prevMentors.map((m) => {
        if (m.id === mentorId) {
          return { ...m, ...updatedFields };
        }
        return m;
      });

      if (currentUser && currentUser.id === mentorId) {
        const updatedCurrentUser = updatedList.find((m) => m.id === mentorId);
        if (updatedCurrentUser) setCurrentUser(updatedCurrentUser);
      }

      return updatedList;
    });
    return { success: true };
  };

  const getMentorById = (mentorId) => {
    return mentors.find((m) => m.id === mentorId || m.mentorId === mentorId);
  };

  const getMenteeById = (menteeId) => {
    return mentees.find((m) => m.id === menteeId);
  };

  const updateMenteeProfile = (menteeId, updatedFields) => {
    let updatedRecord = null;
    setMentees((prevMentees) => {
      const updatedList = prevMentees.map((m) => {
        if (m.id === menteeId) {
          let initials = m.initials;
          if (updatedFields.name && updatedFields.name.trim()) {
            const parts = updatedFields.name.trim().split(/\s+/);
            initials = parts.length === 1
              ? parts[0].slice(0, 2).toUpperCase()
              : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
          }
          updatedRecord = { ...m, ...updatedFields, initials };
          return updatedRecord;
        }
        return m;
      });

      if (currentUser && currentUser.id === menteeId && updatedRecord) {
        setCurrentUser(updatedRecord);
      }

      return updatedList;
    });
    return { success: true, mentee: updatedRecord };
  };

  // ── 7. Connections Context Methods ──────────────────────────────────────
  const getConnectionBetween = (userId1, userId2) => {
    if (!userId1 || !userId2) return null;
    return connections.find(
      (c) =>
        (c.requesterId === userId1 && c.recipientId === userId2) ||
        (c.requesterId === userId2 && c.recipientId === userId1)
    );
  };

  const isUserConnected = (userId1, userId2) => {
    const conn = getConnectionBetween(userId1, userId2);
    if (conn && conn.status === 'accepted') return true;

    // Check pre-assigned mentee-mentor relationship
    const u1 = getUserById(userId1);
    const u2 = getUserById(userId2);
    if (u1?.mentorId === userId2 || u2?.mentorId === userId1) return true;

    // Check approved allocation
    const hasAllocation = allocations.some(
      (a) =>
        a.status === 'approved' &&
        ((a.menteeId === userId1 && a.mentorId === userId2) ||
         (a.menteeId === userId2 && a.mentorId === userId1))
    );
    if (hasAllocation) return true;

    return false;
  };

  const sendConnectionRequest = ({ requesterId, recipientId, note = '' }) => {
    const existing = getConnectionBetween(requesterId, recipientId);
    if (existing) {
      if (existing.status === 'pending') {
        return { success: false, error: 'A pending connection request already exists between these users.' };
      }
      if (existing.status === 'accepted') {
        return { success: false, error: 'You are already actively connected.' };
      }
      if (existing.status === 'rejected') {
        // Re-open request
        setConnections((prev) =>
          prev.map((c) =>
            c.id === existing.id
              ? { ...c, status: 'pending', note, updatedAt: new Date().toISOString() }
              : c
          )
        );
        return { success: true, message: 'Connection request re-submitted.' };
      }
    }

    const newConn = {
      id: `conn-${Date.now()}`,
      requesterId,
      recipientId,
      status: 'pending',
      note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConnections((prev) => [newConn, ...prev]);
    return { success: true, connection: newConn };
  };

  const acceptConnectionRequest = (connectionId) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === connectionId
          ? { ...c, status: 'accepted', updatedAt: new Date().toISOString() }
          : c
      )
    );
    return { success: true };
  };

  const rejectConnectionRequest = (connectionId) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === connectionId
          ? { ...c, status: 'rejected', updatedAt: new Date().toISOString() }
          : c
      )
    );
    return { success: true };
  };

  const cancelConnectionRequest = (connectionId) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    return { success: true };
  };

  const removeConnection = (connectionId) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    return { success: true };
  };

  // ── 8. Sessions Context Methods ─────────────────────────────────────────
  const bookSession = ({
    mentorId,
    menteeId,
    title,
    description = '',
    agenda = '',
    requestMessage = '',
    date,
    startTime,
    duration = '45 mins',
    meetingMode = 'Google Meet',
    meetingLink = '',
    initiatedBy = 'mentee',
  }) => {
    if (!mentorId || !menteeId || !title || !date || !startTime) {
      return { success: false, error: 'Please provide all required session booking fields.' };
    }

    const direction = initiatedBy === 'mentor' ? 'mentor_to_mentee' : 'mentee_to_mentor';
    const confirmationRequiredFrom = initiatedBy === 'mentor' ? 'mentee' : 'mentor';

    // Rule: Booking restriction - must be connected or officially allocated
    const isAllocated = allocations.some(
      (a) => a.mentorId === mentorId && a.menteeId === menteeId && a.status === 'approved'
    );
    if (!isAllocated && !isUserConnected(mentorId, menteeId)) {
      return {
        success: false,
        error: initiatedBy === 'mentor'
          ? 'Mentors can only schedule sessions with their officially allocated mentees.'
          : 'You can only book sessions with an accepted connection or assigned mentor.',
      };
    }

    // For mentor-initiated bookings: strictly enforce that mentee belongs to this mentor
    if (initiatedBy === 'mentor') {
      const isMentorMentee = allocations.some(
        (a) => a.mentorId === mentorId && a.menteeId === menteeId && a.status === 'approved'
      ) || (getUserById(menteeId)?.mentorId === mentorId);

      if (!isMentorMentee) {
        return {
          success: false,
          error: 'Mentors can only book sessions with mentees officially allocated to their group.',
        };
      }
    }

    // Rule: Prevent booking in the past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return { success: false, error: 'Cannot book sessions on a past date.' };
    }

    // Rule: Prevent duplicate pending or confirmed request for the exact same pair, date, and time
    const duplicate = sessions.find(
      (s) =>
        s.mentorId === mentorId &&
        s.menteeId === menteeId &&
        s.date === date &&
        s.startTime === startTime &&
        (s.status === 'confirmed' || s.status === 'pending')
    );
    if (duplicate) {
      return {
        success: false,
        error: `A ${duplicate.status} session request already exists between this mentor and mentee on ${date} at ${startTime}.`,
      };
    }

    // Rule: Check mentor availability (prevent overlapping sessions for mentor)
    const mentorConflict = sessions.find(
      (s) =>
        s.mentorId === mentorId &&
        s.date === date &&
        s.startTime === startTime &&
        (s.status === 'confirmed' || s.status === 'pending')
    );
    if (mentorConflict) {
      return {
        success: false,
        error: `Mentor already has a ${mentorConflict.status} session on ${date} at ${startTime}. Please select a different time slot.`,
      };
    }

    // Rule: Check mentee availability (prevent overlapping sessions for mentee)
    const menteeConflict = sessions.find(
      (s) =>
        s.menteeId === menteeId &&
        s.date === date &&
        s.startTime === startTime &&
        (s.status === 'confirmed' || s.status === 'pending')
    );
    if (menteeConflict) {
      const menteeObj = getUserById(menteeId);
      return {
        success: false,
        error: `${menteeObj?.name || 'Mentee'} already has a ${menteeConflict.status} session on ${date} at ${startTime}. Please select a different time slot.`,
      };
    }

    const mentor = getMentorById(mentorId);
    let mockLink = meetingLink;
    if (!mockLink) {
      mockLink = meetingMode.toLowerCase().includes('campus')
        ? mentor?.availability?.mode || 'Campus Cabin 304'
        : `https://meet.google.com/mentor-${Date.now().toString().slice(-4)}`;
    }

    const newSession = {
      id: `sess-${Date.now()}`,
      mentorId,
      menteeId,
      title: title.trim(),
      description: (description || agenda || '').trim(),
      agenda: (agenda || description || title || '').trim(),
      requestMessage: (requestMessage || '').trim(),
      date,
      startTime,
      duration,
      meetingMode,
      meetingLink: mockLink,
      status: 'pending',
      initiatedBy,
      bookingDirection: direction,
      confirmationRequiredFrom,
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);

    // Send in-app notification
    const sender = initiatedBy === 'mentor' ? getMentorById(mentorId) : getUserById(menteeId);
    setNotifications((prev) => [
      {
        id: Date.now(),
        text: initiatedBy === 'mentor'
          ? `Mentor ${sender?.name || ''} proposed a session "${title}" on ${date} at ${startTime}.`
          : `Mentee ${sender?.name || ''} requested a session "${title}" on ${date} at ${startTime}.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, session: newSession };
  };

  const confirmSession = (sessionId, confirmingUserId = null) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, error: 'Session not found.' };
    }
    if (session.status !== 'pending') {
      return { success: false, error: `Session is already ${session.status} and cannot be confirmed.` };
    }

    // Validation: Only designated recipient can confirm
    if (confirmingUserId) {
      const requiredFrom = session.confirmationRequiredFrom || (session.initiatedBy === 'mentor' ? 'mentee' : 'mentor');
      if (requiredFrom === 'mentee' && session.menteeId !== confirmingUserId) {
        return { success: false, error: 'Unauthorized: Only the designated mentee can accept this proposed session.' };
      }
      if (requiredFrom === 'mentor' && session.mentorId !== confirmingUserId) {
        return { success: false, error: 'Unauthorized: Only the designated mentor can accept this session request.' };
      }
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'confirmed', confirmedAt: new Date().toISOString() }
          : s
      )
    );

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Session "${session.title}" on ${session.date} is now confirmed.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true };
  };

  const cancelSession = (sessionId, reason = '', cancellingUserId = null) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, error: 'Session not found.' };
    }

    // Authorization check
    if (cancellingUserId) {
      const isParticipant =
        session.mentorId === cancellingUserId ||
        session.menteeId === cancellingUserId ||
        currentUser?.role === 'Coordinator' ||
        currentUser?.role === 'HOD' ||
        currentUser?.role === 'Admin';
      if (!isParticipant) {
        return { success: false, error: 'Unauthorized: You cannot cancel or decline this session.' };
      }
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'cancelled',
              cancelReason: reason || 'Cancelled/Declined by user',
              cancelledAt: new Date().toISOString(),
            }
          : s
      )
    );

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Session "${session.title}" was declined/cancelled.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true };
  };

  const declineSession = (sessionId, reason = 'Declined by recipient', decliningUserId = null) => {
    return cancelSession(sessionId, reason, decliningUserId);
  };

  const completeSession = (sessionId) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'completed' } : s))
    );
    return { success: true };
  };

  // ── 9. Reviews Context Methods ──────────────────────────────────────────
  const addReview = ({ sessionId = null, mentorId, menteeId, rating, comment }) => {
    if (!mentorId || !menteeId || !rating || !comment) {
      return { success: false, error: 'Please provide rating score and written comment.' };
    }

    if (comment.trim().length < 5) {
      return { success: false, error: 'Please provide meaningful feedback (at least 5 characters).' };
    }

    // Rule: One review per mentee per session (if session-based)
    if (sessionId) {
      const sess = sessions.find((s) => s.id === sessionId);
      if (sess && sess.status !== 'completed') {
        return { success: false, error: 'Only completed sessions can be reviewed.' };
      }
      if (sess && sess.menteeId !== menteeId) {
        return { success: false, error: 'You can only review sessions you participated in.' };
      }
      const existing = reviews.find((r) => r.sessionId === sessionId && r.menteeId === menteeId);
      if (existing) {
        return { success: false, error: 'You have already submitted a review for this completed session.' };
      }
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      sessionId,
      mentorId,
      menteeId,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);
    return { success: true, review: newReview };
  };

  const updateReview = (reviewId, { rating, comment }, requestingUserId = null) => {
    const existing = reviews.find((r) => r.id === reviewId);
    if (!existing) return { success: false, error: 'Review not found.' };
    if (requestingUserId && existing.menteeId !== requestingUserId) {
      return { success: false, error: 'Unauthorized: You can only edit your own reviews.' };
    }
    if (comment && comment.trim().length < 5) {
      return { success: false, error: 'Please provide meaningful feedback (at least 5 characters).' };
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              rating: Number(rating) || r.rating,
              comment: comment ? comment.trim() : r.comment,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    return { success: true };
  };

  const deleteReview = (reviewId, requestingUserId = null) => {
    const existing = reviews.find((r) => r.id === reviewId);
    if (!existing) return { success: false, error: 'Review not found.' };
    if (requestingUserId && existing.menteeId !== requestingUserId) {
      return { success: false, error: 'Unauthorized: You can only delete your own reviews.' };
    }
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    return { success: true };
  };

  const getMentorReviews = (mentorId) => {
    return reviews.filter((r) => r.mentorId === mentorId);
  };

  const getMenteeReviews = (menteeId) => {
    return reviews.filter((r) => r.menteeId === menteeId);
  };

  const getSessionReview = (sessionId) => {
    if (!sessionId) return null;
    return reviews.find((r) => r.sessionId === sessionId);
  };

  // ── 10. Coordinator & Department Hierarchy Context Methods ───────────────
  const getCoordinatorById = (coordinatorId) => {
    return coordinators.find((c) => c.id === coordinatorId);
  };

  const getCoordinatorMentors = (coordinatorId) => {
    return mentors.filter((m) => m.coordinatorId === coordinatorId);
  };

  const getCoordinatorMentees = (coordinatorId) => {
    return mentees.filter((m) => m.coordinatorId === coordinatorId);
  };

  const getCoordinatorSessions = (coordinatorId) => {
    const coordMentorIds = new Set(
      mentors.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );
    const coordMenteeIds = new Set(
      mentees.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );
    return sessions.filter(
      (s) => coordMentorIds.has(s.mentorId) || coordMenteeIds.has(s.menteeId)
    );
  };

  const getCoordinatorConnections = (coordinatorId) => {
    const coordMentorIds = new Set(
      mentors.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );
    const coordMenteeIds = new Set(
      mentees.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );
    return connections.filter(
      (c) =>
        coordMentorIds.has(c.requesterId) ||
        coordMentorIds.has(c.recipientId) ||
        coordMenteeIds.has(c.requesterId) ||
        coordMenteeIds.has(c.recipientId)
    );
  };

  const assignMentorToCoordinator = (mentorId, targetCoordinatorId) => {
    const targetCoord = coordinators.find((c) => c.id === targetCoordinatorId);
    if (!targetCoord) {
      return { success: false, error: 'Target coordinator does not exist.' };
    }

    setMentors((prev) =>
      prev.map((m) => {
        if (m.id === mentorId) {
          return {
            ...m,
            coordinatorId: targetCoord.id,
            coordinatorName: targetCoord.name,
          };
        }
        return m;
      })
    );
    return { success: true };
  };

  const assignMenteeToCoordinator = (menteeId, targetCoordinatorId) => {
    const targetCoord = coordinators.find((c) => c.id === targetCoordinatorId);
    if (!targetCoord) {
      return { success: false, error: 'Target coordinator does not exist.' };
    }

    setMentees((prev) =>
      prev.map((m) => {
        if (m.id === menteeId) {
          return {
            ...m,
            coordinatorId: targetCoord.id,
            coordinatorName: targetCoord.name,
          };
        }
        return m;
      })
    );
    return { success: true };
  };

  const addCoordinator = (coordData) => {
    if (!coordData.name || !coordData.email) {
      return { success: false, error: 'Please provide coordinator name and email.' };
    }

    const newId = `user-coord-${Date.now()}`;
    const initials =
      coordData.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CO';

    const newCoord = {
      id: newId,
      name: coordData.name.trim(),
      email: coordData.email.trim().toLowerCase(),
      password: 'password123',
      role: 'Coordinator',
      title: coordData.title?.trim() || 'Cohort Coordinator',
      cohort: coordData.cohort?.trim() || 'General Engineering Cohort',
      department: coordData.department || 'Computer Science & Engineering',
      company: 'University CSE Department',
      phone: coordData.phone?.trim() || '+91 98765 00088',
      joinedYear: new Date().getFullYear(),
      initials,
      avatarColor: 'bg-indigo-600',
      status: 'active',
      bio: coordData.bio?.trim() || 'Cohort Coordinator overseeing student mentorship operations.',
    };

    setCoordinators((prev) => [...prev, newCoord]);
    return { success: true, coordinator: newCoord };
  };

  const updateCoordinator = (coordinatorId, updatedFields) => {
    setCoordinators((prev) =>
      prev.map((c) => {
        if (c.id === coordinatorId) {
          const updated = { ...c, ...updatedFields };
          if (currentUser?.id === coordinatorId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return c;
      })
    );
    return { success: true };
  };

  const toggleCoordinatorStatus = (coordinatorId) => {
    setCoordinators((prev) =>
      prev.map((c) => {
        if (c.id === coordinatorId) {
          const nextStatus = c.status === 'active' ? 'inactive' : 'active';
          const updated = { ...c, status: nextStatus };
          if (currentUser?.id === coordinatorId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return c;
      })
    );
    return { success: true };
  };

  const reassignAllFromCoordinator = (sourceCoordId, targetCoordId) => {
    const targetCoord = coordinators.find((c) => c.id === targetCoordId);
    if (!targetCoord) {
      return { success: false, error: 'Target coordinator not found.' };
    }

    setMentors((prev) =>
      prev.map((m) =>
        m.coordinatorId === sourceCoordId
          ? { ...m, coordinatorId: targetCoord.id, coordinatorName: targetCoord.name }
          : m
      )
    );

    setMentees((prev) =>
      prev.map((m) =>
        m.coordinatorId === sourceCoordId
          ? { ...m, coordinatorId: targetCoord.id, coordinatorName: targetCoord.name }
          : m
      )
    );

    return { success: true };
  };

  const getCoordinatorStats = (coordinatorId) => {
    const groupMentors = mentors.filter((m) => m.coordinatorId === coordinatorId);
    const groupMentees = mentees.filter((m) => m.coordinatorId === coordinatorId);
    const mentorIds = new Set(groupMentors.map((m) => m.id));
    const menteeIds = new Set(groupMentees.map((m) => m.id));

    const groupConnections = connections.filter(
      (c) =>
        mentorIds.has(c.requesterId) ||
        mentorIds.has(c.recipientId) ||
        menteeIds.has(c.requesterId) ||
        menteeIds.has(c.recipientId)
    );
    const activeConnections = groupConnections.filter((c) => c.status === 'accepted').length;
    const pendingRequests = groupConnections.filter((c) => c.status === 'pending').length;

    const groupSessions = sessions.filter(
      (s) => mentorIds.has(s.mentorId) || menteeIds.has(s.menteeId)
    );
    const upcomingSessions = groupSessions.filter(
      (s) => s.status === 'confirmed' || s.status === 'pending'
    ).length;
    const completedSessions = groupSessions.filter((s) => s.status === 'completed').length;

    const avgRating =
      groupMentors.length > 0
        ? Number(
            (
              groupMentors.reduce((acc, m) => acc + (Number(m.rating) || 0), 0) /
              groupMentors.length
            ).toFixed(1)
          )
        : 0;

    return {
      mentorsCount: groupMentors.length,
      menteesCount: groupMentees.length,
      activeConnections,
      pendingRequests,
      upcomingSessions,
      completedSessions,
      totalSessions: groupSessions.length,
      avgRating,
    };
  };

  const getDepartmentStats = () => {
    const activeCoordinators = coordinators.filter((c) => c.status === 'active').length;
    const totalCoordinators = coordinators.length;
    const totalMentors = mentors.length;
    const totalMentees = mentees.length;
    const totalConnections = connections.filter((c) => c.status === 'accepted').length;
    const pendingRequests = connections.filter((c) => c.status === 'pending').length;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === 'completed').length;
    const upcomingSessions = sessions.filter(
      (s) => s.status === 'confirmed' || s.status === 'pending'
    ).length;
    const avgRating =
      mentors.length > 0
        ? Number(
            (
              mentors.reduce((acc, m) => acc + (Number(m.rating) || 0), 0) / mentors.length
            ).toFixed(1)
          )
        : 0;

    return {
      totalCoordinators,
      activeCoordinators,
      totalMentors,
      totalMentees,
      totalConnections,
      pendingRequests,
      totalSessions,
      completedSessions,
      upcomingSessions,
      avgRating,
    };
  };

  // ── 12. Allocation Context Methods ──────────────────────────────────────

  /** Mentee requests a preferred mentor */
  const requestMentorAllocation = ({ menteeId, mentorId, requestMessage = '' }) => {
    // Validate: no active (approved) allocation already exists
    const activeAlloc = allocations.find(
      (a) => a.menteeId === menteeId && a.status === 'approved'
    );
    if (activeAlloc) {
      return { success: false, error: 'You already have an active mentor allocation. Please request reassignment through your coordinator.' };
    }

    // Validate: no duplicate pending request
    const pendingReq = allocations.find(
      (a) => a.menteeId === menteeId && a.mentorId === mentorId && a.status === 'pending'
    );
    if (pendingReq) {
      return { success: false, error: 'You already have a pending request for this mentor.' };
    }

    // Find the mentee to get their coordinatorId
    const mentee = mentees.find((m) => m.id === menteeId);
    if (!mentee) return { success: false, error: 'Mentee not found.' };

    const now = new Date().toISOString();
    const newAlloc = {
      id: `alloc-${Date.now()}`,
      menteeId,
      mentorId,
      coordinatorId: mentee.coordinatorId,
      method: 'self_selected',
      status: 'pending',
      requestMessage: requestMessage.trim(),
      decisionNote: '',
      createdAt: now,
      updatedAt: now,
      decidedAt: null,
    };

    setAllocations((prev) => [newAlloc, ...prev]);
    return { success: true, allocation: newAlloc };
  };

  /** Coordinator approves a pending allocation request */
  const approveMentorAllocation = (allocationId, decisionNote = '') => {
    let targetAlloc = null;
    setAllocations((prev) =>
      prev.map((a) => {
        if (a.id === allocationId && a.status === 'pending') {
          const now = new Date().toISOString();
          targetAlloc = { ...a, status: 'approved', decisionNote: decisionNote.trim(), updatedAt: now, decidedAt: now };
          return targetAlloc;
        }
        return a;
      })
    );

    // Update mentee's mentorId and mentorName
    if (targetAlloc) {
      const mentor = mentors.find((m) => m.id === targetAlloc.mentorId);
      setMentees((prev) =>
        prev.map((m) => {
          if (m.id === targetAlloc.menteeId) {
            return { ...m, mentorId: targetAlloc.mentorId, mentorName: mentor?.name || '' };
          }
          return m;
        })
      );
    }

    return { success: true };
  };

  /** Coordinator rejects a pending allocation request */
  const rejectMentorAllocation = (allocationId, decisionNote = '') => {
    setAllocations((prev) =>
      prev.map((a) => {
        if (a.id === allocationId && a.status === 'pending') {
          const now = new Date().toISOString();
          return { ...a, status: 'rejected', decisionNote: decisionNote.trim(), updatedAt: now, decidedAt: now };
        }
        return a;
      })
    );
    return { success: true };
  };

  /** Mentee cancels their own pending request */
  const cancelAllocationRequest = (allocationId) => {
    setAllocations((prev) =>
      prev.map((a) => {
        if (a.id === allocationId && a.status === 'pending') {
          return { ...a, status: 'cancelled', updatedAt: new Date().toISOString() };
        }
        return a;
      })
    );
    return { success: true };
  };

  /** Coordinator directly assigns a mentor to a mentee */
  const directlyAssignMentor = ({ menteeId, mentorId, coordinatorId, note = '' }) => {
    // Validate: mentee doesn't already have an active allocation
    const activeAlloc = allocations.find(
      (a) => a.menteeId === menteeId && a.status === 'approved'
    );
    if (activeAlloc) {
      return { success: false, error: 'This mentee already has an active mentor allocation. Use reassignment instead.' };
    }

    const mentor = mentors.find((m) => m.id === mentorId);
    if (!mentor) return { success: false, error: 'Mentor not found.' };

    const now = new Date().toISOString();
    const newAlloc = {
      id: `alloc-${Date.now()}`,
      menteeId,
      mentorId,
      coordinatorId,
      method: 'coordinator_assigned',
      status: 'approved',
      requestMessage: '',
      decisionNote: note.trim(),
      createdAt: now,
      updatedAt: now,
      decidedAt: now,
    };

    setAllocations((prev) => [newAlloc, ...prev]);

    // Update mentee's mentorId and mentorName
    setMentees((prev) =>
      prev.map((m) => {
        if (m.id === menteeId) {
          return { ...m, mentorId: mentor.id, mentorName: mentor.name };
        }
        return m;
      })
    );

    return { success: true, allocation: newAlloc };
  };

  /** Coordinator reassigns a mentee to a different mentor */
  const reassignMentor = ({ menteeId, newMentorId, coordinatorId, note = '' }) => {
    const newMentor = mentors.find((m) => m.id === newMentorId);
    if (!newMentor) return { success: false, error: 'New mentor not found.' };

    // Mark old active allocation as 'reassigned'
    setAllocations((prev) =>
      prev.map((a) => {
        if (a.menteeId === menteeId && a.status === 'approved') {
          return { ...a, status: 'reassigned', updatedAt: new Date().toISOString() };
        }
        return a;
      })
    );

    // Create new active allocation
    const now = new Date().toISOString();
    const newAlloc = {
      id: `alloc-${Date.now()}`,
      menteeId,
      mentorId: newMentorId,
      coordinatorId,
      method: 'coordinator_assigned',
      status: 'approved',
      requestMessage: '',
      decisionNote: note.trim() || 'Reassigned by coordinator.',
      createdAt: now,
      updatedAt: now,
      decidedAt: now,
    };

    setAllocations((prev) => [newAlloc, ...prev]);

    // Update mentee's mentorId and mentorName
    setMentees((prev) =>
      prev.map((m) => {
        if (m.id === menteeId) {
          return { ...m, mentorId: newMentor.id, mentorName: newMentor.name };
        }
        return m;
      })
    );

    return { success: true, allocation: newAlloc };
  };

  /** Get the active (approved) allocation for a mentee */
  const getMenteeAllocation = (menteeId) => {
    return allocations.find((a) => a.menteeId === menteeId && a.status === 'approved') || null;
  };

  /** Get all allocations for a mentee (history) */
  const getMenteeAllocations = (menteeId) => {
    return allocations.filter((a) => a.menteeId === menteeId);
  };

  /** Get mentees with approved allocation for a mentor */
  const getMentorAllocatedMentees = (mentorId) => {
    return allocations
      .filter((a) => a.mentorId === mentorId && a.status === 'approved')
      .map((a) => {
        const mentee = mentees.find((m) => m.id === a.menteeId);
        return { ...a, mentee };
      });
  };

  /** Get all allocations for a coordinator's group */
  const getCoordinatorAllocations = (coordinatorId) => {
    return allocations.filter((a) => a.coordinatorId === coordinatorId);
  };

  /** Get pending allocation requests for a coordinator */
  const getCoordinatorPendingAllocations = (coordinatorId) => {
    return allocations.filter(
      (a) => a.coordinatorId === coordinatorId && a.status === 'pending'
    );
  };

  // ── 13. Session Reports Context Methods ─────────────────────────────────

  /** Submit a structured session report and mark session completed */
  const submitSessionReport = ({
    sessionId,
    mentorId,
    menteeId,
    sessionDate,
    duration,
    mode,
    attendance = 'present',
    objectives,
    topicsDiscussed = [],
    progressSummary,
    challenges = '',
    mentorObservations = '',
    actionItems = [],
    nextSessionFocus = '',
    suggestedNextSessionDate = '',
  }) => {
    if (!sessionId || !mentorId || !menteeId) {
      return { success: false, error: 'Session, mentor and mentee identifiers are required.' };
    }

    // Validation: prevent duplicate reports for the same session
    const existing = sessionReports.find((r) => r.sessionId === sessionId);
    if (existing) {
      return { success: false, error: 'A report has already been submitted for this session.' };
    }

    // Validation: ensure session belongs to this mentor
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (!targetSession) {
      return { success: false, error: 'Session not found.' };
    }
    if (targetSession.mentorId !== mentorId) {
      return { success: false, error: 'Only the conducting mentor may submit a session report.' };
    }

    // Find coordinator for the mentee
    const mentee = mentees.find((m) => m.id === menteeId);
    const mentor = mentors.find((m) => m.id === mentorId);
    const coordinatorId = mentee?.coordinatorId || mentor?.coordinatorId || 'user-coord-1';

    const now = new Date().toISOString();
    const newReport = {
      id: `rep-${sessionId}`,
      sessionId,
      mentorId,
      menteeId,
      coordinatorId,
      sessionDate: sessionDate || targetSession.date,
      duration: duration || targetSession.duration || '45 mins',
      mode: mode || targetSession.meetingMode || 'Online (Google Meet)',
      attendance,
      objectives: objectives?.trim() || '',
      topicsDiscussed: Array.isArray(topicsDiscussed) ? topicsDiscussed.filter(Boolean) : [topicsDiscussed],
      progressSummary: progressSummary?.trim() || '',
      challenges: challenges?.trim() || '',
      mentorObservations: mentorObservations?.trim() || '',
      actionItems: Array.isArray(actionItems) ? actionItems.filter(Boolean) : [actionItems],
      nextSessionFocus: nextSessionFocus?.trim() || '',
      suggestedNextSessionDate: suggestedNextSessionDate || '',
      createdAt: now,
      updatedAt: now,
    };

    setSessionReports((prev) => [newReport, ...prev]);

    // Mark the session as completed
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'completed' } : s))
    );

    return { success: true, report: newReport };
  };

  /** Get a report for a specific session */
  const getSessionReport = (sessionId) => {
    return sessionReports.find((r) => r.sessionId === sessionId) || null;
  };

  /** Get reports submitted by a mentor */
  const getMentorReports = (mentorId) => {
    return sessionReports.filter((r) => r.mentorId === mentorId);
  };

  /** Get reports for a mentee */
  const getMenteeReports = (menteeId) => {
    return sessionReports.filter((r) => r.menteeId === menteeId);
  };

  /** Get reports for a coordinator's group */
  const getCoordinatorReports = (coordinatorId) => {
    const groupMenteeIds = new Set(
      mentees.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );
    const groupMentorIds = new Set(
      mentors.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );

    return sessionReports.filter(
      (r) =>
        r.coordinatorId === coordinatorId ||
        groupMenteeIds.has(r.menteeId) ||
        groupMentorIds.has(r.mentorId)
    );
  };

  /** Get department-wide reports (HOD / Admin) */
  const getDepartmentReports = () => {
    return sessionReports;
  };

  // ── 14. Goals & Goal Progress Updates Context Methods ───────────────────

  /** Create a new goal for a mentee */
  const createGoal = (goalData, currentUserId) => {
    const menteeId = goalData.menteeId || currentUserId;
    if (!menteeId) {
      return { success: false, error: 'Mentee identification is required.' };
    }
    if (currentUserId && menteeId !== currentUserId) {
      return { success: false, error: 'Unauthorized: A mentee can only create goals for themselves.' };
    }

    const title = goalData.title?.trim();
    const description = goalData.description?.trim();
    const category = goalData.category?.trim();
    const expectedOutcome = goalData.expectedOutcome?.trim();
    const targetDate = goalData.targetDate?.trim();

    if (!title) {
      return { success: false, error: 'Goal title is required.' };
    }
    if (!description) {
      return { success: false, error: 'Goal description is required.' };
    }
    if (!category || !['Academic', 'Professional', 'Personal'].includes(category)) {
      return { success: false, error: 'Valid category (Academic, Professional, or Personal) is required.' };
    }
    if (!expectedOutcome) {
      return { success: false, error: 'Expected outcome is required.' };
    }
    if (!targetDate) {
      return { success: false, error: 'Target date is required.' };
    }

    const today = new Date().toISOString().split('T')[0];
    if (targetDate < today) {
      return { success: false, error: 'Target date cannot be in the past.' };
    }

    // Allocation check: Mentee must have an officially allocated mentor
    const activeAllocation = getMenteeAllocation(menteeId);
    if (!activeAllocation || !activeAllocation.mentorId) {
      return {
        success: false,
        error: 'Mentor allocation required: You do not have an officially allocated mentor. You must be assigned to an approved faculty mentor before creating goals.',
      };
    }

    const newGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menteeId,
      mentorId: activeAllocation.mentorId,
      coordinatorId: activeAllocation.coordinatorId || 'user-coord-1',
      category,
      title,
      description,
      expectedOutcome,
      targetDate,
      trimester: goalData.trimester || 'Trimester 2',
      notes: goalData.notes ? goalData.notes.trim() : '',
      status: 'pending_approval',
      progress: 0,
      mentorFeedback: null,
      previousFeedback: [],
      evaluation: null,
      evaluationComment: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evaluatedAt: null,
    };

    setGoals((prev) => [newGoal, ...prev]);

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Goal "${title}" submitted and is pending mentor review.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, goal: newGoal };
  };

  /** Update an existing goal (pending approval or changes requested) */
  const updateGoal = (goalId, updates, currentUserId) => {
    const goalIndex = goals.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found.' };
    }

    const currentGoal = goals[goalIndex];
    if (currentUserId && currentGoal.menteeId !== currentUserId) {
      return { success: false, error: 'Unauthorized: You can only edit your own goals.' };
    }

    if (currentGoal.status !== 'pending_approval' && currentGoal.status !== 'changes_requested') {
      return {
        success: false,
        error: `Goals with status "${currentGoal.status}" cannot be modified.`,
      };
    }

    const title = updates.title !== undefined ? updates.title.trim() : currentGoal.title;
    const description = updates.description !== undefined ? updates.description.trim() : currentGoal.description;
    const category = updates.category !== undefined ? updates.category.trim() : currentGoal.category;
    const expectedOutcome = updates.expectedOutcome !== undefined ? updates.expectedOutcome.trim() : currentGoal.expectedOutcome;
    const targetDate = updates.targetDate !== undefined ? updates.targetDate.trim() : currentGoal.targetDate;

    if (!title) return { success: false, error: 'Goal title is required.' };
    if (!description) return { success: false, error: 'Goal description is required.' };
    if (!category || !['Academic', 'Professional', 'Personal'].includes(category)) {
      return { success: false, error: 'Valid category is required.' };
    }
    if (!expectedOutcome) return { success: false, error: 'Expected outcome is required.' };
    if (!targetDate) return { success: false, error: 'Target date is required.' };

    const today = new Date().toISOString().split('T')[0];
    if (targetDate < today && targetDate !== currentGoal.targetDate) {
      return { success: false, error: 'Target date cannot be in the past.' };
    }

    const updatedGoal = {
      ...currentGoal,
      title,
      description,
      category,
      expectedOutcome,
      targetDate,
      trimester: updates.trimester !== undefined ? updates.trimester : currentGoal.trimester,
      notes: updates.notes !== undefined ? updates.notes.trim() : currentGoal.notes,
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));

    return { success: true, goal: updatedGoal };
  };

  /** Resubmit a goal with changes_requested status */
  const resubmitGoal = (goalId, updates, currentUserId) => {
    const goalIndex = goals.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found.' };
    }

    const currentGoal = goals[goalIndex];
    if (currentUserId && currentGoal.menteeId !== currentUserId) {
      return { success: false, error: 'Unauthorized: You can only resubmit your own goals.' };
    }

    if (currentGoal.status !== 'changes_requested') {
      return {
        success: false,
        error: 'Only goals with "Changes Requested" status can be resubmitted.',
      };
    }

    const title = updates.title !== undefined ? updates.title.trim() : currentGoal.title;
    const description = updates.description !== undefined ? updates.description.trim() : currentGoal.description;
    const category = updates.category !== undefined ? updates.category.trim() : currentGoal.category;
    const expectedOutcome = updates.expectedOutcome !== undefined ? updates.expectedOutcome.trim() : currentGoal.expectedOutcome;
    const targetDate = updates.targetDate !== undefined ? updates.targetDate.trim() : currentGoal.targetDate;

    if (!title || !description || !expectedOutcome || !targetDate) {
      return { success: false, error: 'All core goal fields are required for resubmission.' };
    }

    // Preserve previous mentor feedback in history
    const previousFeedback = Array.isArray(currentGoal.previousFeedback)
      ? [...currentGoal.previousFeedback]
      : [];
    if (currentGoal.mentorFeedback) {
      previousFeedback.push({
        feedback: currentGoal.mentorFeedback,
        requestedAt: currentGoal.updatedAt || currentGoal.createdAt,
      });
    }

    const resubmittedGoal = {
      ...currentGoal,
      title,
      description,
      category,
      expectedOutcome,
      targetDate,
      trimester: updates.trimester !== undefined ? updates.trimester : currentGoal.trimester,
      notes: updates.notes !== undefined ? updates.notes.trim() : currentGoal.notes,
      status: 'pending_approval',
      mentorFeedback: null,
      previousFeedback,
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => prev.map((g) => (g.id === goalId ? resubmittedGoal : g)));

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Goal "${title}" resubmitted and is pending mentor approval.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, goal: resubmittedGoal };
  };

  /** Add progress update for an approved active goal */
  const addGoalProgressUpdate = (
    { goalId, progressPercentage, progressNote, achievements, supportingDescription, reasonForDecrease },
    currentUserId
  ) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) {
      return { success: false, error: 'Goal not found.' };
    }

    if (currentUserId && goal.menteeId !== currentUserId) {
      return {
        success: false,
        error: 'Unauthorized: Only the assigned mentee can submit progress updates for this goal.',
      };
    }

    if (goal.status !== 'active') {
      return {
        success: false,
        error: 'Progress updates can only be submitted for Active approved goals.',
      };
    }

    const newPct = Math.min(100, Math.max(0, Number(progressPercentage)));
    if (isNaN(newPct)) {
      return { success: false, error: 'Valid progress percentage (0-100) is required.' };
    }

    if (newPct < goal.progress && (!reasonForDecrease || !reasonForDecrease.trim())) {
      return {
        success: false,
        error: 'Progress cannot decrease without an explanation note justifying the correction.',
      };
    }

    const updateRecord = {
      id: `gup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      goalId,
      menteeId: goal.menteeId,
      previousProgress: goal.progress,
      progressPercentage: newPct,
      progressNote: progressNote?.trim() || '',
      achievements: achievements?.trim() || '',
      supportingDescription: supportingDescription?.trim() || '',
      reasonForDecrease: newPct < goal.progress ? reasonForDecrease.trim() : null,
      createdAt: new Date().toISOString(),
    };

    setGoalUpdates((prev) => [updateRecord, ...prev]);

    // Update goal's progress percentage & updatedAt
    // Note: Do not automatically mark goal as achieved. Only mentor can evaluate & finalize.
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              progress: newPct,
              updatedAt: new Date().toISOString(),
            }
          : g
      )
    );

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Progress for goal "${goal.title}" updated to ${newPct}%.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, update: updateRecord };
  };

  /** Query methods for goals */
  const getMenteeGoals = (menteeId) => {
    return goals.filter((g) => g.menteeId === menteeId);
  };

  const getGoalUpdates = (goalId) => {
    return goalUpdates
      .filter((u) => u.goalId === goalId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getGoalById = (goalId) => {
    return goals.find((g) => g.id === goalId) || null;
  };

  /** Mentor actions for Goals Management */

  /** Approve a pending goal */
  const approveGoal = (goalId, feedback = '', mentorId) => {
    const goalIndex = goals.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found.' };
    }

    const goal = goals[goalIndex];
    if (goal.status !== 'pending_approval') {
      return { success: false, error: `Goal cannot be approved from "${goal.status}" status.` };
    }

    // Verify mentor authorization (mentor assigned or allocated)
    const mentorAllocatedMenteeIds = getMentorAllocatedMentees(mentorId).map((a) => a.menteeId);
    if (goal.mentorId !== mentorId && !mentorAllocatedMenteeIds.includes(goal.menteeId)) {
      return { success: false, error: 'Unauthorized: You can only approve goals for your officially allocated mentees.' };
    }

    const trimmedFeedback = feedback?.trim() || '';

    const updatedGoal = {
      ...goal,
      status: 'active',
      approvedAt: new Date().toISOString(),
      approvedBy: mentorId,
      mentorFeedback: trimmedFeedback || goal.mentorFeedback || 'Approved by mentor.',
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));

    // Record feedback item if provided
    if (trimmedFeedback) {
      const fbItem = {
        id: `gfb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        goalId,
        mentorId,
        comment: trimmedFeedback,
        type: 'approval',
        createdAt: new Date().toISOString(),
      };
      setGoalFeedback((prev) => [fbItem, ...prev]);
    }

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Goal "${goal.title}" was approved by your mentor and is now Active.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, goal: updatedGoal };
  };

  /** Request changes on a pending goal */
  const requestGoalChanges = (goalId, feedback, mentorId) => {
    if (!feedback || !feedback.trim()) {
      return { success: false, error: 'Feedback comment is mandatory when requesting changes.' };
    }

    const goalIndex = goals.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found.' };
    }

    const goal = goals[goalIndex];
    if (goal.status !== 'pending_approval') {
      return { success: false, error: 'Changes can only be requested on goals pending approval.' };
    }

    // Verify mentor authorization
    const mentorAllocatedMenteeIds = getMentorAllocatedMentees(mentorId).map((a) => a.menteeId);
    if (goal.mentorId !== mentorId && !mentorAllocatedMenteeIds.includes(goal.menteeId)) {
      return { success: false, error: 'Unauthorized: You can only request changes for your allocated mentees.' };
    }

    const trimmedFeedback = feedback.trim();

    const updatedGoal = {
      ...goal,
      status: 'changes_requested',
      mentorFeedback: trimmedFeedback,
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));

    // Record feedback in history
    const fbItem = {
      id: `gfb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      goalId,
      mentorId,
      comment: trimmedFeedback,
      type: 'changes_requested',
      createdAt: new Date().toISOString(),
    };
    setGoalFeedback((prev) => [fbItem, ...prev]);

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Mentor requested changes on your goal "${goal.title}".`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, goal: updatedGoal };
  };

  /** Reject a pending goal */
  const rejectGoal = (goalId, rejectionReason, mentorId) => {
    if (!rejectionReason || !rejectionReason.trim()) {
      return { success: false, error: 'A rejection reason is required.' };
    }

    const goalIndex = goals.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found.' };
    }

    const goal = goals[goalIndex];
    if (goal.status !== 'pending_approval') {
      return { success: false, error: 'Only pending approval goals can be rejected.' };
    }

    // Verify mentor authorization
    const mentorAllocatedMenteeIds = getMentorAllocatedMentees(mentorId).map((a) => a.menteeId);
    if (goal.mentorId !== mentorId && !mentorAllocatedMenteeIds.includes(goal.menteeId)) {
      return { success: false, error: 'Unauthorized: You can only reject goals for your allocated mentees.' };
    }

    const trimmedReason = rejectionReason.trim();

    const updatedGoal = {
      ...goal,
      status: 'rejected',
      mentorFeedback: trimmedReason,
      rejectionReason: trimmedReason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: mentorId,
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));

    const fbItem = {
      id: `gfb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      goalId,
      mentorId,
      comment: `Goal Rejected: ${trimmedReason}`,
      type: 'rejection',
      createdAt: new Date().toISOString(),
    };
    setGoalFeedback((prev) => [fbItem, ...prev]);

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Goal "${goal.title}" was rejected by your mentor.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, goal: updatedGoal };
  };

  /** Add ongoing mentor feedback to an active goal */
  const addMentorGoalFeedback = (goalId, comment, mentorId) => {
    if (!comment || !comment.trim()) {
      return { success: false, error: 'Feedback comment cannot be empty.' };
    }

    const goalIndex = goals.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found.' };
    }

    const goal = goals[goalIndex];
    if (goal.status !== 'active') {
      return { success: false, error: 'Feedback can only be added to Active approved goals.' };
    }

    // Verify mentor authorization
    const mentorAllocatedMenteeIds = getMentorAllocatedMentees(mentorId).map((a) => a.menteeId);
    if (goal.mentorId !== mentorId && !mentorAllocatedMenteeIds.includes(goal.menteeId)) {
      return { success: false, error: 'Unauthorized: You can only provide feedback for your allocated mentees.' };
    }

    const trimmedComment = comment.trim();

    const updatedGoal = {
      ...goal,
      mentorFeedback: trimmedComment,
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));

    const fbItem = {
      id: `gfb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      goalId,
      mentorId,
      comment: trimmedComment,
      type: 'feedback',
      createdAt: new Date().toISOString(),
    };
    setGoalFeedback((prev) => [fbItem, ...prev]);

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `New mentor feedback posted on goal "${goal.title}".`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, feedback: fbItem, goal: updatedGoal };
  };

  /** Evaluate an active goal at trimester end */
  const evaluateGoal = (
    { goalId, outcome, evaluationComment, recommendations = '' },
    mentorId
  ) => {
    if (!evaluationComment || !evaluationComment.trim()) {
      return { success: false, error: 'Evaluation comments are mandatory.' };
    }

    const normalizedOutcome = outcome?.toLowerCase();
    if (normalizedOutcome !== 'achieved' && normalizedOutcome !== 'not_achieved') {
      return { success: false, error: 'Evaluation outcome must be "Achieved" or "Not Achieved".' };
    }

    const goalIndex = goals.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found.' };
    }

    const goal = goals[goalIndex];
    if (goal.status !== 'active') {
      return { success: false, error: 'Only Active approved goals can be evaluated.' };
    }

    // Verify mentor authorization
    const mentorAllocatedMenteeIds = getMentorAllocatedMentees(mentorId).map((a) => a.menteeId);
    if (goal.mentorId !== mentorId && !mentorAllocatedMenteeIds.includes(goal.menteeId)) {
      return { success: false, error: 'Unauthorized: You can only evaluate goals for your allocated mentees.' };
    }

    const trimmedComment = evaluationComment.trim();
    const trimmedRecs = recommendations?.trim() || '';
    const finalStatus = normalizedOutcome === 'achieved' ? 'achieved' : 'not_achieved';
    const finalEvaluation = normalizedOutcome === 'achieved' ? 'Achieved' : 'Not Achieved';

    const updatedGoal = {
      ...goal,
      status: finalStatus,
      evaluation: finalEvaluation,
      evaluationComment: trimmedComment,
      recommendations: trimmedRecs,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: mentorId,
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));

    const fbItem = {
      id: `gfb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      goalId,
      mentorId,
      comment: `Final Evaluation (${finalEvaluation}): ${trimmedComment}${
        trimmedRecs ? ` | Recommendations: ${trimmedRecs}` : ''
      }`,
      type: 'evaluation',
      createdAt: new Date().toISOString(),
    };
    setGoalFeedback((prev) => [fbItem, ...prev]);

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Your goal "${goal.title}" was evaluated as "${finalEvaluation}" by your mentor.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, goal: updatedGoal };
  };

  /** Get all goals belonging to mentees officially allocated to this mentor */
  const getMentorGoals = (mentorId) => {
    if (!mentorId) return [];
    const mentorAllocatedMenteeIds = getMentorAllocatedMentees(mentorId).map((a) => a.menteeId);
    return goals.filter(
      (g) => g.mentorId === mentorId || mentorAllocatedMenteeIds.includes(g.menteeId)
    );
  };

  /** Get goals pending approval for this mentor */
  const getPendingGoalApprovals = (mentorId) => {
    return getMentorGoals(mentorId).filter((g) => g.status === 'pending_approval');
  };

  /** Get all feedback history records for a goal */
  const getGoalFeedback = (goalId) => {
    return goalFeedback
      .filter((f) => f.goalId === goalId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  /** Get goal counts summary for a specific mentee */
  const getMenteeGoalSummary = (menteeId) => {
    const mGoals = goals.filter((g) => g.menteeId === menteeId);
    return {
      total: mGoals.length,
      pending: mGoals.filter((g) => g.status === 'pending_approval' || g.status === 'changes_requested').length,
      active: mGoals.filter((g) => g.status === 'active').length,
      achieved: mGoals.filter((g) => g.status === 'achieved').length,
      notAchieved: mGoals.filter((g) => g.status === 'not_achieved').length,
      rejected: mGoals.filter((g) => g.status === 'rejected').length,
    };
  };

  /**
   * Get all goals belonging strictly to a Coordinator's assigned mentoring cohort group.
   * Access control verified against coordinator identity:
   * - Goals whose coordinatorId matches the coordinatorId
   * - Goals of mentees currently or historically belonging to this coordinator's cohort
   * - Goals of mentors belonging to this coordinator's cohort
   */
  const getCoordinatorGoals = (coordinatorId) => {
    if (!coordinatorId) return [];

    // Verify coordinator identity exists
    const coord = coordinators.find((c) => c.id === coordinatorId);
    if (!coord) return [];

    const groupMenteeIds = new Set(
      mentees.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );
    const groupMentorIds = new Set(
      mentors.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );

    return goals.filter((g) => {
      // 1. Explicit historical coordinator association
      if (g.coordinatorId === coordinatorId) return true;
      // 2. Goal belongs to a mentee in this coordinator's cohort
      if (groupMenteeIds.has(g.menteeId)) return true;
      // 3. Goal belongs to an allocated mentor in this coordinator's cohort
      if (groupMentorIds.has(g.mentorId)) return true;
      return false;
    });
  };

  /**
   * Calculate dynamically computed statistics for a Coordinator's group goals:
   * Total Goals, Pending Approval, Active Goals, Achieved Goals, Not Achieved Goals, Requiring Attention.
   */
  const getCoordinatorGoalStats = (coordinatorId) => {
    const cGoals = getCoordinatorGoals(coordinatorId);
    const now = new Date();

    const pending = cGoals.filter((g) => g.status === 'pending_approval' || g.status === 'changes_requested').length;
    const active = cGoals.filter((g) => g.status === 'active').length;
    const achieved = cGoals.filter((g) => g.status === 'achieved').length;
    const notAchieved = cGoals.filter((g) => g.status === 'not_achieved').length;
    const rejected = cGoals.filter((g) => g.status === 'rejected').length;

    // Goals Requiring Attention:
    // 1. Active & overdue (targetDate < today)
    // 2. Active & low progress (<30%)
    // 3. Active & no update in >14 days
    // 4. Pending approval for >7 days
    const attentionGoals = cGoals.filter((g) => {
      if (g.status === 'active') {
        if (g.targetDate && new Date(g.targetDate) < now) return true;
        if ((g.progress ?? 0) < 30) return true;
        if (g.updatedAt) {
          const daysSinceUpdate = (now - new Date(g.updatedAt)) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate > 14) return true;
        }
      }
      if (g.status === 'pending_approval') {
        const daysPending = (now - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysPending > 7) return true;
      }
      if (g.status === 'changes_requested') return true;
      return false;
    });

    return {
      total: cGoals.length,
      pending,
      active,
      achieved,
      notAchieved,
      rejected,
      requiringAttention: attentionGoals.length,
      attentionGoalIds: attentionGoals.map((g) => g.id),
    };
  };

  /**
   * Get all goals across the entire department for HOD access.
   * Access control verified against user role (HOD or Admin).
   * Returns unified goal records spanning both Coordinator groups without duplicates.
   */
  const getDepartmentGoals = () => {
    // Return all goals centralized across the department
    return goals;
  };

  /**
   * Calculate dynamically computed statistics for all department goals:
   * Total Goals, Pending Approvals, Active Goals, Achieved Goals, Not Achieved Goals, Requiring Attention,
   * Overall Completion Rate (calculated from finalized goals: achieved / (achieved + notAchieved)).
   */
  const getDepartmentGoalStats = () => {
    const dGoals = getDepartmentGoals();
    const now = new Date();

    const pending = dGoals.filter((g) => g.status === 'pending_approval' || g.status === 'changes_requested').length;
    const active = dGoals.filter((g) => g.status === 'active').length;
    const achieved = dGoals.filter((g) => g.status === 'achieved').length;
    const notAchieved = dGoals.filter((g) => g.status === 'not_achieved').length;
    const rejected = dGoals.filter((g) => g.status === 'rejected').length;

    // Finalized goals count and completion rate
    const finalized = achieved + notAchieved;
    const completionRate = finalized > 0 ? Math.round((achieved / finalized) * 100) : 0;

    const attentionGoals = dGoals.filter((g) => {
      if (g.status === 'active') {
        if (g.targetDate && new Date(g.targetDate) < now) return true;
        if ((g.progress ?? 0) < 30) return true;
        if (g.updatedAt) {
          const daysSinceUpdate = (now - new Date(g.updatedAt)) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate > 14) return true;
        }
      }
      if (g.status === 'pending_approval') {
        const daysPending = (now - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysPending > 7) return true;
      }
      if (g.status === 'changes_requested') return true;
      return false;
    });

    return {
      total: dGoals.length,
      pending,
      active,
      achieved,
      notAchieved,
      rejected,
      finalized,
      completionRate,
      requiringAttention: attentionGoals.length,
      attentionGoalIds: attentionGoals.map((g) => g.id),
    };
  };

  // ── 13. Overall Trimester Reviews Context Methods (Stage 6) ───────────────

  /**
   * Calculate goal outcome summary for a mentee in a specific trimester.
   * Derives Academic, Professional, Personal totals/achieved/notAchieved,
   * plus overall totals, achieved, not achieved, and completion rate.
   * Excludes rejected goals from outcome calculations.
   */
  const getMenteeTrimesterGoalSummary = (menteeId, trimester) => {
    if (!menteeId || !trimester) {
      return {
        academic: { total: 0, achieved: 0, notAchieved: 0 },
        professional: { total: 0, achieved: 0, notAchieved: 0 },
        personal: { total: 0, achieved: 0, notAchieved: 0 },
        overall: { total: 0, achieved: 0, notAchieved: 0, completionRate: 0, activeOrPendingCount: 0 },
        goals: [],
        unresolvedGoals: [],
      };
    }

    const tGoals = goals.filter(
      (g) => g.menteeId === menteeId && g.trimester === trimester && g.status !== 'rejected'
    );

    const calcCat = (cat) => {
      const catGoals = tGoals.filter((g) => g.category === cat);
      return {
        total: catGoals.length,
        achieved: catGoals.filter((g) => g.status === 'achieved').length,
        notAchieved: catGoals.filter((g) => g.status === 'not_achieved').length,
      };
    };

    const academic = calcCat('Academic');
    const professional = calcCat('Professional');
    const personal = calcCat('Personal');

    const total = tGoals.length;
    const achieved = tGoals.filter((g) => g.status === 'achieved').length;
    const notAchieved = tGoals.filter((g) => g.status === 'not_achieved').length;
    const finalized = achieved + notAchieved;
    const completionRate = finalized > 0 ? Math.round((achieved / finalized) * 100) : 0;

    // Unresolved goals (active, pending_approval, changes_requested)
    const unresolvedGoals = tGoals.filter((g) => g.status !== 'achieved' && g.status !== 'not_achieved');

    return {
      academic,
      professional,
      personal,
      overall: {
        total,
        achieved,
        notAchieved,
        completionRate,
        activeOrPendingCount: unresolvedGoals.length,
      },
      goals: tGoals,
      unresolvedGoals,
    };
  };

  /** Get all trimester reviews for a mentee */
  const getMenteeTrimesterReviews = (menteeId) => {
    if (!menteeId) return [];
    return trimesterReviews.filter((r) => r.menteeId === menteeId);
  };

  /** Get all trimester reviews for a mentor's officially allocated mentees */
  const getMentorTrimesterReviews = (mentorId) => {
    if (!mentorId) return [];
    const allocatedMenteeIds = new Set(
      getMentorAllocatedMentees(mentorId).map((a) => a.menteeId)
    );
    return trimesterReviews.filter(
      (r) => r.mentorId === mentorId || allocatedMenteeIds.has(r.menteeId)
    );
  };

  /** Get all trimester reviews for a coordinator's cohort group */
  const getCoordinatorTrimesterReviews = (coordinatorId) => {
    if (!coordinatorId) return [];
    const groupMenteeIds = new Set(
      mentees.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );
    const groupMentorIds = new Set(
      mentors.filter((m) => m.coordinatorId === coordinatorId).map((m) => m.id)
    );
    return trimesterReviews.filter(
      (r) =>
        r.coordinatorId === coordinatorId ||
        groupMenteeIds.has(r.menteeId) ||
        groupMentorIds.has(r.mentorId)
    );
  };

  /** Get all department trimester reviews (HOD access) */
  const getDepartmentTrimesterReviews = () => {
    return trimesterReviews;
  };

  /**
   * Save a draft trimester reflection for a mentee.
   */
  const saveTrimesterReviewDraft = ({
    menteeId,
    trimester,
    reflections,
  }) => {
    if (!menteeId || !trimester) {
      return { success: false, error: 'Mentee ID and trimester are required.' };
    }

    // Mentee must have goals in this trimester
    const hasGoals = goals.some((g) => g.menteeId === menteeId && g.trimester === trimester);
    if (!hasGoals) {
      return { success: false, error: `You do not have any goal records in ${trimester}.` };
    }

    // Resolve current allocated mentor and coordinator
    const mentee = getUserById(menteeId);
    const activeAlloc = allocations.find(
      (a) => a.menteeId === menteeId && a.status === 'approved'
    );
    const mentorId = activeAlloc?.mentorId || mentee?.mentorId;
    const coordinatorId = activeAlloc?.coordinatorId || mentee?.coordinatorId;

    if (!mentorId) {
      return { success: false, error: 'You must have an officially allocated mentor to complete a trimester review.' };
    }

    // Check if an existing review exists for this mentee and trimester
    const existing = trimesterReviews.find(
      (r) => r.menteeId === menteeId && r.trimester === trimester
    );

    if (existing && existing.status === 'finalized') {
      return { success: false, error: 'This trimester review has already been finalized and cannot be modified.' };
    }

    const nowIso = new Date().toISOString();

    if (existing) {
      const updated = {
        ...existing,
        reflections: {
          ...existing.reflections,
          ...reflections,
        },
        updatedAt: nowIso,
      };
      setTrimesterReviews((prev) => prev.map((r) => (r.id === existing.id ? updated : r)));
      return { success: true, review: updated };
    }

    const newReview = {
      id: `trev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menteeId,
      mentorId,
      coordinatorId: coordinatorId || 'user-coord-1',
      trimester,
      status: 'draft',
      reflections: reflections || {
        academic: { achievements: '', challenges: '', improvements: '' },
        professional: { skillsDeveloped: '', careerProgress: '', nextFocus: '' },
        personal: { improvements: '', challengesOvercome: '', nextPriorities: '' },
        overall: { majorAchievements: '', areasForImprovement: '', nextTrimesterPriorities: '' },
      },
      mentorReview: {
        overallComments: '',
        recommendations: '',
        nextTrimesterPriorities: '',
        acknowledgedBy: '',
        acknowledgedAt: null,
      },
      submittedAt: null,
      finalizedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setTrimesterReviews((prev) => [newReview, ...prev]);
    return { success: true, review: newReview };
  };

  /**
   * Submit a trimester reflection to the officially allocated mentor.
   */
  const submitTrimesterReview = ({
    menteeId,
    trimester,
    reflections,
  }) => {
    if (!menteeId || !trimester) {
      return { success: false, error: 'Mentee ID and trimester are required.' };
    }

    // Validation: Require meaningful overall reflection
    const overall = reflections?.overall;
    if (
      !overall ||
      !overall.majorAchievements?.trim() ||
      !overall.areasForImprovement?.trim() ||
      !overall.nextTrimesterPriorities?.trim()
    ) {
      return {
        success: false,
        error: 'Please complete the Major Achievements, Areas for Improvement, and Next Trimester Priorities fields before submitting.',
      };
    }

    // Save or update to submitted
    const mentee = getUserById(menteeId);
    const activeAlloc = allocations.find(
      (a) => a.menteeId === menteeId && a.status === 'approved'
    );
    const mentorId = activeAlloc?.mentorId || mentee?.mentorId;
    const coordinatorId = activeAlloc?.coordinatorId || mentee?.coordinatorId;

    if (!mentorId) {
      return { success: false, error: 'You must have an officially allocated mentor to submit a review.' };
    }

    const existing = trimesterReviews.find(
      (r) => r.menteeId === menteeId && r.trimester === trimester
    );

    if (existing && existing.status === 'finalized') {
      return { success: false, error: 'This trimester review has already been finalized.' };
    }

    const nowIso = new Date().toISOString();

    const submittedReview = {
      id: existing ? existing.id : `trev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menteeId,
      mentorId: existing?.mentorId || mentorId,
      coordinatorId: existing?.coordinatorId || coordinatorId || 'user-coord-1',
      trimester,
      status: 'submitted',
      reflections,
      mentorReview: existing?.mentorReview || {
        overallComments: '',
        recommendations: '',
        nextTrimesterPriorities: '',
        acknowledgedBy: '',
        acknowledgedAt: null,
      },
      submittedAt: nowIso,
      finalizedAt: null,
      createdAt: existing ? existing.createdAt : nowIso,
      updatedAt: nowIso,
    };

    if (existing) {
      setTrimesterReviews((prev) => prev.map((r) => (r.id === existing.id ? submittedReview : r)));
    } else {
      setTrimesterReviews((prev) => [submittedReview, ...prev]);
    }

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Trimester review submitted for ${trimester}. Awaiting mentor evaluation.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, review: submittedReview };
  };

  /**
   * Finalize a trimester review by the officially allocated mentor.
   * Strict validation:
   * 1. Mentor must be officially allocated to this mentee.
   * 2. All applicable goals in this trimester must have a final outcome ('achieved' or 'not_achieved').
   * 3. Mentor comments and acknowledgment name required.
   */
  const finalizeTrimesterReview = ({
    reviewId,
    mentorId,
    overallComments,
    recommendations,
    nextTrimesterPriorities,
    acknowledgedBy,
  }) => {
    if (!reviewId || !mentorId) {
      return { success: false, error: 'Review ID and Mentor ID are required.' };
    }

    const review = trimesterReviews.find((r) => r.id === reviewId);
    if (!review) {
      return { success: false, error: 'Trimester review record not found.' };
    }

    if (review.status === 'finalized') {
      return { success: false, error: 'This trimester review has already been finalized.' };
    }

    // Permission check: officially allocated mentor only
    const allocatedMenteeIds = getMentorAllocatedMentees(mentorId).map((a) => a.menteeId);
    if (review.mentorId !== mentorId && !allocatedMenteeIds.includes(review.menteeId)) {
      return {
        success: false,
        error: 'Unauthorized: You can only finalize trimester reviews for your officially allocated mentees.',
      };
    }

    // Validation: All goals in this trimester must have final outcome ('achieved' or 'not_achieved')
    const summary = getMenteeTrimesterGoalSummary(review.menteeId, review.trimester);
    if (summary.unresolvedGoals.length > 0) {
      const titles = summary.unresolvedGoals.map((g) => `"${g.title}" (${g.status})`).join(', ');
      return {
        success: false,
        error: `Cannot finalize review: ${summary.unresolvedGoals.length} goal(s) in ${review.trimester} remain unresolved: ${titles}. All goals must be evaluated as 'Achieved' or 'Not Achieved' first.`,
        unresolvedGoals: summary.unresolvedGoals,
      };
    }

    if (!overallComments || !overallComments.trim()) {
      return { success: false, error: 'Please provide overall mentor evaluation comments.' };
    }

    if (!acknowledgedBy || !acknowledgedBy.trim()) {
      return { success: false, error: 'Please enter your authenticated name to acknowledge this review.' };
    }

    const nowIso = new Date().toISOString();

    const finalizedReview = {
      ...review,
      status: 'finalized',
      mentorReview: {
        overallComments: overallComments.trim(),
        recommendations: recommendations?.trim() || '',
        nextTrimesterPriorities: nextTrimesterPriorities?.trim() || '',
        acknowledgedBy: acknowledgedBy.trim(),
        acknowledgedAt: nowIso,
      },
      finalizedAt: nowIso,
      updatedAt: nowIso,
    };

    setTrimesterReviews((prev) => prev.map((r) => (r.id === review.id ? finalizedReview : r)));

    setNotifications((prev) => [
      {
        id: Date.now(),
        text: `Your ${review.trimester} overall review was finalized by your mentor.`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, review: finalizedReview };
  };

  // ── 14. Auth helpers ────────────────────────────────────────────────────
  const login = (email, password, rememberMe = true) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    let user = mentors.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (!user) {
      user = coordinators.find(
        (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
      );
    }

    if (!user) {
      user = mentees.find(
        (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
      );
    }

    if (!user) {
      user = mockUsers.find(
        (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
      );
    }

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password. Please use a valid demo account credential.',
      };
    }

    setCurrentUser(user);
    setCurrentRoleState(user.role);
    setIsAuthenticated(true);

    if (rememberMe) {
      try {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ userId: user.id, email: user.email, role: user.role })
        );
      } catch (e) {
        console.warn('Failed to save rememberMe session', e);
      }
    }

    return { success: true, user };
  };

  const loginAsUser = (user) => {
    if (!user) return { success: false, error: 'User not found.' };
    const resolved = resolveUser(user.id, user.email) || user;

    setCurrentUser(resolved);
    setCurrentRoleState(resolved.role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ userId: resolved.id, email: resolved.email, role: resolved.role })
      );
    } catch (e) {
      console.warn('Failed to save quick login session', e);
    }
    return { success: true, user: resolved };
  };

  const switchDemoRole = (role) => {
    let targetUser = null;
    if (role === 'Mentor') {
      targetUser = mentors[0];
    } else if (role === 'Coordinator') {
      targetUser = coordinators[0] || mockUsers.find((u) => u.role === 'Coordinator');
    } else if (role === 'Mentee') {
      targetUser = mentees[0] || mockUsers.find((u) => u.role === 'Mentee');
    } else {
      targetUser = mockUsers.find((u) => u.role === role);
    }

    if (targetUser) {
      return loginAsUser(targetUser);
    }
    return { success: false, error: `No user found for role ${role}` };
  };

  const switchDemoUser = (user) => {
    return loginAsUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRoleState(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear session', e);
    }
  };

  const resetToInitialDemoData = () => {
    try {
      localStorage.removeItem(MENTEES_STORAGE_KEY);
      localStorage.removeItem(ALLOCATIONS_STORAGE_KEY);
      localStorage.removeItem(SESSION_REPORTS_STORAGE_KEY);
      localStorage.removeItem(CONNECTIONS_STORAGE_KEY);
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
      localStorage.removeItem(REVIEWS_STORAGE_KEY);
      localStorage.removeItem(MENTORS_STORAGE_KEY);
      localStorage.removeItem(COORDINATORS_STORAGE_KEY);
      localStorage.removeItem(GOALS_STORAGE_KEY);
      localStorage.removeItem(GOAL_UPDATES_STORAGE_KEY);
      localStorage.removeItem(GOAL_FEEDBACK_STORAGE_KEY);
      localStorage.removeItem(TRIMESTER_REVIEWS_STORAGE_KEY);
      setMentees(initialMentees);
      setAllocations(initialAllocations);
      setSessionReports(initialSessionReports);
      setGoals(initialGoals);
      setGoalUpdates(initialGoalUpdates);
      setGoalFeedback(initialGoalFeedback);
      setTrimesterReviews(initialTrimesterReviews);
      setConnections(initialConnections);
      setSessions(initialSessions);
      setReviews(initialReviews);
      setMentors(initialMentors);
      setCoordinators(initialCoordinators);
      if (currentUser) {
        const refreshed = resolveUser(currentUser.id, currentUser.email);
        if (refreshed) setCurrentUser(refreshed);
      }
    } catch (e) {
      console.warn('Failed to reset demo data', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        currentRole,
        coordinators,
        mentors,
        mentees,
        connections,
        sessions,
        reviews,
        getUserById,
        getMentorById,
        getMenteeById,
        updateMentorProfile,
        updateMenteeProfile,
        // Department Hierarchy & Coordinator Management
        getCoordinatorById,
        getCoordinatorMentors,
        getCoordinatorMentees,
        getCoordinatorSessions,
        getCoordinatorConnections,
        assignMentorToCoordinator,
        assignMenteeToCoordinator,
        addCoordinator,
        updateCoordinator,
        toggleCoordinatorStatus,
        reassignAllFromCoordinator,
        getCoordinatorStats,
        getDepartmentStats,
        // Connections
        getConnectionBetween,
        isUserConnected,
        sendConnectionRequest,
        acceptConnectionRequest,
        rejectConnectionRequest,
        cancelConnectionRequest,
        removeConnection,
        // Sessions
        bookSession,
        confirmSession,
        cancelSession,
        declineSession,
        completeSession,
        // Reviews
        addReview,
        updateReview,
        deleteReview,
        getMentorReviews,
        getMenteeReviews,
        getSessionReview,
        // Allocations
        allocations,
        requestMentorAllocation,
        approveMentorAllocation,
        rejectMentorAllocation,
        cancelAllocationRequest,
        directlyAssignMentor,
        reassignMentor,
        getMenteeAllocation,
        getMenteeAllocations,
        getMentorAllocatedMentees,
        getCoordinatorAllocations,
        getCoordinatorPendingAllocations,
        // Session Reports
        sessionReports,
        submitSessionReport,
        getSessionReport,
        getMentorReports,
        getMenteeReports,
        getCoordinatorReports,
        getDepartmentReports,
        // Goals Management
        goals,
        goalUpdates,
        goalFeedback,
        createGoal,
        updateGoal,
        resubmitGoal,
        addGoalProgressUpdate,
        approveGoal,
        requestGoalChanges,
        rejectGoal,
        addMentorGoalFeedback,
        evaluateGoal,
        getMenteeGoals,
        getMentorGoals,
        getPendingGoalApprovals,
        getGoalUpdates,
        getGoalFeedback,
        getMenteeGoalSummary,
        getCoordinatorGoals,
        getCoordinatorGoalStats,
        getDepartmentGoals,
        getDepartmentGoalStats,
        getGoalById,
        // Overall Trimester Reviews (Stage 6)
        trimesterReviews,
        getMenteeTrimesterGoalSummary,
        getMenteeTrimesterReviews,
        getMentorTrimesterReviews,
        getCoordinatorTrimesterReviews,
        getDepartmentTrimesterReviews,
        saveTrimesterReviewDraft,
        submitTrimesterReview,
        finalizeTrimesterReview,
        // Auth & App
        setCurrentRole: switchDemoRole,
        login,
        loginAsUser,
        switchDemoRole,
        switchDemoUser,
        logout,
        resetToInitialDemoData,
        sidebarOpen,
        setSidebarOpen,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        notifications,
        unreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
