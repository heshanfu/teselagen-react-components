function Demo() {
  return (
    <div>
      <Button
        onClick={async function handleClick() {
          const doAction = await showConfirmationDialog({
            text:
              "Are you sure you want to re-run this tool? Downstream tools with linked outputs will need to be re-run as well!",
              intent: Intent.DANGER, //applied to the right most confirm button
              confirmButtonText: "Yep!",
              cancelButtonText: "Nope",
              canEscapeKeyCancel: true //this is false by default
          });
          console.log("doAction:", doAction);
        }}
        text="Do some action"
      />
    </div>
  );
}

render(Demo);
