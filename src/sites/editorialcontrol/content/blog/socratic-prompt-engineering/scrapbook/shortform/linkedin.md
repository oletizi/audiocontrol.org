Prompt engineering has at least two shapes. Most operators only reach for one.

The first is the prescriptive prompt — a precise specification of what the agent should do, often encoded as a skill, called from a slash command, run by every future agent that touches the project. Real, repeatable, the foundation of a working agent operation. Most of my work with coding agents lives in this shape, and this isn't an argument against it.

The second is the leading question. A few weeks ago an agent of mine reached for a state-management library to track whether a piece of vintage hardware was connected. I didn't say "don't use Zustand." I asked: *"why do you need Zustand to find out if the device is connected? Why can't you send a SysEx ping and see if the device responds?"* Two questions in one sentence: defend the choice, or fold to the alternative. The agent folded. Saved a dependency, opened a simpler path that an imperative would never have surfaced.

I went back through 76 archived Claude Code sessions to see how often the question, not the prompt, was the thing that actually moved the work forward. 98 operator corrections across the corpus; 10 of them traced directly to the agent acting on a fact it had invented. None of those would have been caught by a more careful prompt — the agent already had everything it needed to fabricate a plausible answer. The question is the move that surfaces what's underneath.

The argument: keep writing the prompts, *and* learn the question.

Full dispatch: https://editorialcontrol.org/blog/socratic-prompt-engineering/
