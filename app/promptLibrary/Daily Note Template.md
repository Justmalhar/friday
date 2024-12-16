# Daily Note - {{date:YYYY-MM-DD}}


## 📅 Schedule

| Time Period | Tasks/Appointments          |
|-------------|-----------------------------|
| **Morning** (5AM to 12PM)   | [ ] Task/Appointment 1   |
|                             | [ ] Task/Appointment 2   |
| **Afternoon** (12PM to 6PM) | [ ] Task/Appointment 3   |
|                             | [ ] Task/Appointment 4   |
| **Evening** (6PM to 2AM)    | [ ] Task/Appointment 5   |
|                             | [ ] Task/Appointment 6   |

## ✅ Tasks

Write a data view markdown code block to load tasks from Todo.md file under # Today



Certainly! Here's a sample data view markdown code block that you can use to load tasks from a `Todo.md` file under the tag `# Today`. This assumes you are using a system that supports DataView (like Obsidian).


## ✅ Tasks

```dataview
table
    text as "Task"
from "Todo.md"
where contains(tags, "# Today")
sort file.mtime desc
```

In this code block:
- The `table` command creates a table format for displaying tasks.
- `text as "Task"` specifies that the task text will be displayed in the column labeled "Task".
- The `from "Todo.md"` line indicates that it should look for tasks in the specified file.
- The `where contains(tags, "# Today")` filters tasks to only show those tagged with `# Today`.
- Finally, it sorts the results by modification time in descending order.

Make sure your system is set up to recognize and process DataView queries properly!

## 💡 Ideas & Notes
- Idea/Note A
- Idea/Note B

## 💭 Reflection & Journal
- What went well today?
	-
	
- What could have been better?
	-

---
[[01-Daily Planner]]
