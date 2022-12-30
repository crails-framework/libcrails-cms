export function updateCsrfTokenFromResponse(body) {
  const inputs = document.querySelectorAll("[name='csrf-token']");
  for (let i = 0 ; i < inputs.length ; ++i)
    inputs[i].value = body["csrf-token"];
}
