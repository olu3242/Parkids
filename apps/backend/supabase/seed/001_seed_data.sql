-- ============================================================
-- PAR-KIDS — Seed Data
-- Migration: 002_seed_data
-- ============================================================

-- ── CHECK-IN TEMPLATE: Weekly (All Ages Base) ────────────────
INSERT INTO public.check_in_templates (id, name, description, age_group, frequency, is_default, sections)
VALUES (
  gen_random_uuid(),
  'Weekly Family Check-In — Early Childhood',
  'A warm, emoji-first check-in designed for children ages 6–10',
  'early',
  'weekly',
  TRUE,
  '[
    {
      "id": "mood",
      "title": "How Are You Feeling?",
      "description": "Let''s start with how you''re feeling today",
      "icon": "heart",
      "order": 1,
      "respondent": "child",
      "questions": [
        {
          "id": "mood_scale",
          "text": "Pick the face that shows how you feel!",
          "type": "mood_scale",
          "required": true
        },
        {
          "id": "mood_word",
          "text": "Pick one word for your week:",
          "type": "multi_select",
          "options": ["Happy", "Excited", "Okay", "Tired", "Sad", "Worried", "Angry", "Silly"],
          "required": false
        }
      ]
    },
    {
      "id": "school",
      "title": "School & Learning",
      "description": "How was school this week?",
      "icon": "book",
      "order": 2,
      "respondent": "both",
      "questions": [
        {
          "id": "school_rating",
          "text": "How was school this week?",
          "type": "rating",
          "required": true
        },
        {
          "id": "school_favorite",
          "text": "What was your favorite thing at school?",
          "type": "short_text",
          "placeholder": "Tell me something fun!",
          "required": false
        },
        {
          "id": "school_hard",
          "text": "Was anything hard or confusing?",
          "type": "short_text",
          "placeholder": "It''s okay to say if something was tough",
          "required": false
        }
      ]
    },
    {
      "id": "friends",
      "title": "Friends & Social",
      "description": "Tell me about your friends",
      "icon": "people",
      "order": 3,
      "respondent": "child",
      "questions": [
        {
          "id": "friends_rating",
          "text": "How are things with your friends?",
          "type": "rating",
          "required": true
        },
        {
          "id": "friends_fun",
          "text": "Did you do anything fun with friends?",
          "type": "short_text",
          "required": false
        }
      ]
    },
    {
      "id": "confidence",
      "title": "How You Feel About Yourself",
      "description": "What are you proud of?",
      "icon": "star",
      "order": 4,
      "respondent": "child",
      "questions": [
        {
          "id": "proud_moment",
          "text": "What''s something you did this week that made you proud?",
          "type": "short_text",
          "placeholder": "Even something small counts!",
          "required": false
        }
      ]
    },
    {
      "id": "challenges",
      "title": "Anything Bothering You?",
      "description": "It''s safe to share worries here",
      "icon": "cloud",
      "order": 5,
      "respondent": "child",
      "questions": [
        {
          "id": "worry",
          "text": "Is anything bothering you or making you worried?",
          "type": "short_text",
          "placeholder": "You can tell me anything",
          "required": false
        }
      ]
    },
    {
      "id": "wins",
      "title": "Your Wins! 🎉",
      "description": "Let''s celebrate the good stuff",
      "icon": "trophy",
      "order": 6,
      "respondent": "child",
      "questions": [
        {
          "id": "biggest_win",
          "text": "What was your biggest win this week?",
          "type": "short_text",
          "placeholder": "Tell me your best moment!",
          "required": false
        }
      ]
    },
    {
      "id": "goals",
      "title": "My Goal This Week",
      "description": "Let''s pick something to work on",
      "icon": "target",
      "order": 7,
      "respondent": "both",
      "questions": [
        {
          "id": "mini_goal",
          "text": "What''s one thing you want to try or do before next week?",
          "type": "short_text",
          "placeholder": "I want to...",
          "required": false
        }
      ]
    },
    {
      "id": "parent_reflection",
      "title": "Parent Reflection",
      "description": "Your private thoughts (child won''t see this)",
      "icon": "lock",
      "order": 8,
      "respondent": "parent",
      "questions": [
        {
          "id": "parent_concern",
          "text": "Any concerns or things to follow up on?",
          "type": "long_text",
          "required": false
        },
        {
          "id": "parent_proud",
          "text": "What are you proud of in your child this week?",
          "type": "short_text",
          "required": false
        }
      ]
    },
    {
      "id": "bonding",
      "title": "Our Time Together",
      "description": "Pick a fun activity to do together",
      "icon": "heart-hands",
      "order": 9,
      "respondent": "both",
      "questions": [
        {
          "id": "activity_pick",
          "text": "What would you like to do together before next check-in?",
          "type": "multi_select",
          "options": ["Cook together", "Play a game", "Watch a movie", "Go for a walk", "Do a craft", "Read together", "Surprise me!"],
          "required": false
        }
      ]
    }
  ]'::jsonb
);

-- Teen template
INSERT INTO public.check_in_templates (id, name, description, age_group, frequency, is_default, sections)
VALUES (
  gen_random_uuid(),
  'Weekly Family Check-In — Teen',
  'A respectful, reflective check-in for teens ages 14–17',
  'teen',
  'weekly',
  TRUE,
  '[
    {
      "id": "mood",
      "title": "Mood & Emotional Check",
      "order": 1,
      "respondent": "both",
      "questions": [
        {
          "id": "mood_scale",
          "text": "On a scale of 1–5, how would you rate your overall mood this week?",
          "type": "mood_scale",
          "required": true
        },
        {
          "id": "mood_explain",
          "text": "What''s been driving that?",
          "type": "short_text",
          "placeholder": "You can be as brief or as detailed as you want",
          "required": false
        }
      ]
    },
    {
      "id": "school",
      "title": "School & Academic Life",
      "order": 2,
      "respondent": "both",
      "questions": [
        {
          "id": "school_overall",
          "text": "How would you rate your academic week?",
          "type": "rating",
          "required": true
        },
        {
          "id": "school_challenge",
          "text": "Any subjects or assignments that felt challenging?",
          "type": "short_text",
          "required": false
        },
        {
          "id": "school_strength",
          "text": "Where do you feel you''re performing well?",
          "type": "short_text",
          "required": false
        }
      ]
    },
    {
      "id": "social",
      "title": "Social Life & Relationships",
      "order": 3,
      "respondent": "child",
      "questions": [
        {
          "id": "social_rating",
          "text": "How are your friendships feeling right now?",
          "type": "rating",
          "required": true
        },
        {
          "id": "social_highlights",
          "text": "Any highlights or lowlights in your social life this week?",
          "type": "short_text",
          "required": false
        }
      ]
    },
    {
      "id": "confidence",
      "title": "Self & Identity",
      "order": 4,
      "respondent": "child",
      "questions": [
        {
          "id": "confidence_rating",
          "text": "How confident are you feeling in yourself right now?",
          "type": "rating",
          "required": true
        },
        {
          "id": "strength",
          "text": "What''s a strength you''ve demonstrated this week?",
          "type": "short_text",
          "required": false
        }
      ]
    },
    {
      "id": "challenges",
      "title": "Challenges & Concerns",
      "order": 5,
      "respondent": "both",
      "questions": [
        {
          "id": "challenge",
          "text": "Is anything weighing on you that you''d like to talk about?",
          "type": "long_text",
          "required": false
        },
        {
          "id": "support_needed",
          "text": "What kind of support would be most helpful from me right now?",
          "type": "short_text",
          "required": false
        }
      ]
    },
    {
      "id": "wins",
      "title": "Wins & Achievements",
      "order": 6,
      "respondent": "both",
      "questions": [
        {
          "id": "win",
          "text": "What''s something you accomplished or are proud of this week?",
          "type": "short_text",
          "required": false
        }
      ]
    },
    {
      "id": "goals",
      "title": "Goals & Intentions",
      "order": 7,
      "respondent": "both",
      "questions": [
        {
          "id": "goal_review",
          "text": "How did you do on last week''s goal?",
          "type": "short_text",
          "required": false
        },
        {
          "id": "new_goal",
          "text": "What''s one intention you want to set for the coming week?",
          "type": "short_text",
          "required": false
        }
      ]
    },
    {
      "id": "parent_reflection",
      "title": "Parent Notes",
      "order": 8,
      "respondent": "parent",
      "questions": [
        {
          "id": "parent_observation",
          "text": "What have you observed in your teen this week?",
          "type": "long_text",
          "required": false
        }
      ]
    }
  ]'::jsonb
);

-- ── BONDING ACTIVITIES SEED DATA ─────────────────────────────
INSERT INTO public.bonding_activities (title, description, category, age_group, duration_mins) VALUES
  ('Cook a meal together', 'Choose a recipe together and cook it from scratch', 'creative', 'all', 60),
  ('Family game night', 'Pick a board game or card game and play together', 'fun', 'all', 60),
  ('Go for a walk or hike', 'Explore a nearby trail or neighborhood together', 'outdoor', 'all', 45),
  ('Movie night pick', 'Let your child pick the movie. No phones.', 'fun', 'all', 120),
  ('Make art together', 'Draw, paint, or craft something with no rules', 'creative', 'early', 45),
  ('Visit a library', 'Pick books together. Read side by side.', 'learning', 'early', 60),
  ('Build something', 'Legos, blocks, or a small DIY project', 'creative', 'early', 45),
  ('Backyard stargazing', 'Lay outside together and look at the stars', 'outdoor', 'all', 30),
  ('Teach me something', 'Ask your child to teach you something they know', 'learning', 'all', 30),
  ('Volunteer together', 'Find a local cause to support as a team', 'community', 'preteen', 120),
  ('Cook their favorite meal', 'Make exactly what they love, no substitutions', 'creative', 'all', 60),
  ('Take photos together', 'Go on a photography walk, pick a theme', 'creative', 'preteen', 60),
  ('Play their favorite game', 'Let them teach you their favorite video or card game', 'fun', 'teen', 60),
  ('Drive and talk', 'Take a spontaneous drive with no destination', 'fun', 'teen', 45),
  ('Work out together', 'Go for a run, do yoga, or hit the gym together', 'health', 'teen', 45),
  ('Explore a new place', 'Visit a museum, market, or neighborhood new to both', 'learning', 'all', 120),
  ('Write letters to each other', 'Exchange handwritten notes about anything', 'learning', 'all', 30),
  ('Plant something together', 'Start a small herb garden or potted plant', 'outdoor', 'early', 30),
  ('Bake together', 'Cookies, bread, or their favorite treat', 'creative', 'all', 60),
  ('Watch the sunrise or sunset', 'Wake up early or stay up late to watch together', 'outdoor', 'all', 30);
