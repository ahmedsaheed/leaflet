export const progress = (scroll: number) => {
    const progress = ["|", "|", "|", "|", "|", "|", "|", "|", "|", "|"]
    .map((v, i) => {
      return i < (scroll / 100) * 10 ? "<b>|</b>" : v;
    })
    .join("");
  const scroller = `${progress} ${scroll.toFixed(1)}%`;

    // const scroller = `${progressBar} ${scroll.toFixed(1)}%`;
    return (
      scroller
        )
}
