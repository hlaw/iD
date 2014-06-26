iD.ui.confirm = function(selection) {
    var modal = iD.ui.modal(selection);
    var event = d3.dispatch('download');

    modal.select('.modal')
        .classed('modal-alert', true);

    var section = modal.select('.content');

    section.append('div')
        .attr('class', 'modal-section header');

    section.append('div')
        .attr('class', 'modal-section message-text');

    var buttonwrap = section.append('div')
        .attr('class', 'modal-section buttons cf')
        .append('div')
        .style('margin-left', 'auto')
        .style('margin-right', 'auto')
        .style('width', '50%');

    buttonwrap.append('div')
        .attr('class', 'button-wrap col6')
        .append('button')
        .attr('class', 'col2 action')
        .on('click.confirm', function() {
            modal.remove();
        })
        .text('OK, I am doomed');
        //.text(t('confirm.okay'));

    var tooltip = bootstrap.tooltip()
            .placement('bottom')
            .html(true)
            .title('<span>but only if you know what to do with this.</span>');

    buttonwrap.append('div')
        .attr('class', 'button-wrap col6')
        .append('button')
        .attr('class', 'col2 action')
        .on('click.download', function () {
            modal.remove();
            event.download();
        })
        .text('Download changes')
        .call(tooltip);

    return d3.rebind(modal, event, 'on');
};
