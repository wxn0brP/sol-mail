import { mountView, ReactiveCell } from "@wxn0brp/flanker-ui";
import { updateCell } from "@wxn0brp/flanker-ui/storeUtils";

const manageSubjects = qs("#manage-subjects");
manageSubjects.fade = false;
qs("#toggle-subjects").on("click", () => manageSubjects.fadeToggle());

const addSubject = qi("#add-subject-input");
const subjectsCell = new ReactiveCell<string[]>([]);

const view = mountView({
    selector: "#manage-subjects-list",
    queryFunction: async () => subjectsCell.get(),
    template: (subject) => `
        <div class="subject-item">
            <button class="remove" data-subject="${subject}">X</button>
            <span class="subject-name">${subject}</span>
        </div>
    `,
    events: {
        click: {
            ".remove": (el: HTMLButtonElement) => {
                const subject = el.dataset.subject;
                updateCell(subjectsCell, (s) => s.filter(s => s !== subject));
                fetch(`/api/admin/subject`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ subject })
                });
            }
        }
    }
});

subjectsCell.subscribe(() => view.load());
view.load();

qs("#add-subject").on("click", async () => {
    const subject = addSubject.value;
    updateCell(subjectsCell, (s) => [...s, subject]);
    fetch(`/api/admin/subject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ subject })
    });
    addSubject.value = "";
});

fetch("/api/data/subjects").then(res => res.json()).then((s: string[]) => subjectsCell.set(s));