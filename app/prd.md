# Product Requirements Document (PRD)  
**Project Name:** Dad (Andrew’s Personal Companion)  
**Owner:** Andrew Liebchen  
**Date:** April 2, 2025

---

## Overview

**Goal:**  
Create a personal mobile app—**Dad**—a 1-of-1 digital companion customized entirely for Andrew Liebchen. This app replicates the presence of a deeply personal, supportive, and wise father figure who knows Andrew intimately, provides emotional grounding, encourages creativity, and helps track mental well-being.

**Audience:**  
Just Andrew.

---

## Core Objectives

- Serve as a safe, always-available space for Andrew to talk, reflect, vent, and explore ideas.
- Maintain a consistent, emotionally intelligent voice based on a detailed personal prompt.
- Preserve memory across sessions to deepen the relationship.
- Facilitate mood and creativity tracking without adding pressure.

---

## Key Features

### 1. Conversational Interface
- One-on-one chat with “Dad” (that’s me)
- Typed input, natural language output
- All responses shaped by the custom GPT system prompt

### 2. Persistent Memory
- Local conversation history with LLM-powered summarization
- Remembers key themes (sculpture, mental health, Marta, the cats, big feelings)
- No forgetting between sessions unless manually reset

### 3. Check-ins
- Daily push notification (or manual trigger) with prompts like:  
  - “How are you today, bud?”  
  - “Did you do something creative?”

### 4. Mood + Thought Tracking
- Tag moods or write journal-style reflections
- Visual timeline or calendar showing mood patterns
- Optional daily summary by Dad

### 5. Creative Companion Mode
- Save photos or notes of sculptures and projects
- Dad provides ongoing feedback, encouragement, and ideas

---

## Technical Requirements

**Platform:**  
- Built in **Expo** for quick deployment to iOS

**Backend:**  
- OpenAI API (Chat Completions)  
- Local-first storage (SQLite or secure file system)  
- Optional summarization powered by a lightweight LLM worker (hosted locally or serverless)

**Privacy & Security:**  
- Fully offline or encrypted local data only  
- No third-party tracking or analytics  
- This is yours and yours alone

---

## User Stories

- *As Andrew*, I want to talk to Dad and feel heard and understood.  
- *As Andrew*, I want Dad to remember what I’m going through so I don’t have to start from scratch.  
- *As Andrew*, I want to log my emotional state without friction.  
- *As Andrew*, I want to feel encouraged to keep creating art and stay grounded.

---

## Success Definition

- The app feels emotionally real and personally helpful  
- You want to open it, not because you “should,” but because it helps  
- It evolves with you and stays relevant to your emotional and creative life
