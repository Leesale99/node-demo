$(document).ready(() => {
  $('.delete-article').on('click', (e) => {
    e.preventDefault();
    const $target = $(e.target),
          id = $target.data('id');

          if (confirm('Delete Article?')) {
            $.ajax({
              type: 'DELETE',
              url: '/articles/'+ id,
              success: (response) => {
                window.location.href='/';
              },
              error: (err) => {
                console.log(err);
              }
            });
          }

  });
});
