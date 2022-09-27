ChangeLog

v1.1.0

-   New Stable version released

---

v1.1.1

-   Added date eg. new Date in values will work with date input

---

v1.1.2

-   Added warning if submit is used without Form
-   Passed value as a second argument in onSubmit function

---

v1.2.0

-   Added final field in fields to modify the values before submitting

---

v1.2.1 (Bugged)

-   Passed value as a argument in setValues function

---

v1.2.2

-   Bugs from previous version Solved

---

v1.3.0

-   Final prop added to from to finalize data once again before submitting
    <br/>
    **Note:** This final will run on finalized values of particular fields

---

v1.4.0

-   validators field added in fields to apply multiple validations (in Array),
-   you can pass in one validator or multiple validators as array of validators
    <br />
    **Note:** validator and validators are both working but validator will be removed in future updates

---

v2.0.0

-   validators removed and not only validator is supported that can contain a single rule or multiple rules as array
-   validators now only Support functions (support for strings is removed)
-   minLength and maxLength added in inputs for defining so
-   required added in fields for marking the input as required
