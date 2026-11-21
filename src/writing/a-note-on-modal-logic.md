---
title: A note on necessity and the axiom T
date: 2026-10-30
math: true
description: A sample formal post, to show how notation looks.
---

*Sample post, showing that notation works. You can write plain Unicode (□p → p) or full TeX, and you only pay for the second on pages that use it.*

Write $\Box p$ for "it is necessary that $p$." The axiom usually called T says that whatever is necessary is true:

$$\Box p \to p$$

This looks innocent. It is what separates alethic necessity from, say, obligation, where $\Box p \to p$ fails because things ought to be that are not.[^1]

## A small observation

Suppose we also accept the rule of necessitation: if $\vdash p$ then $\vdash \Box p$. Then T gives, for any theorem $p$, that $p$ is both necessary and true, which is unsurprising. The more interesting question is what happens when we weaken T to the axiom D, $\Box p \to \Diamond p$, and I come back to that in the [essay on changing your mind](/writing/on-changing-your-mind/#why-it-is-hard).

[^1]: Deontic logics typically drop T and keep only D, on the thought that what ought to be at least *can* be.
