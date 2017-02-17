'use babel';

import {
    CompositeDisposable
} from 'atom';
import _ from 'lodash';
const fuzzysearch = require('fuzzysearch');

export default {
    subscriptions: null,

    activate(state) {
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(
            atom.commands.add('atom-workspace', {
                'nexd-atom:jump': () => this.jumpToReference()
            })
        );
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    jumpToReference() {
        let editor = atom.workspace.getActiveTextEditor();

        if (!editor) {
            return;
        }

        let selection = editor.getSelectedText();
        if (_.isEmpty(selection)) {
            atom.notifications.addWarning(`Unable to get selection`);
            return;
        }

        if (_.includes(selection, ':')) {
            selection = _(selection).split(':').drop().value();
            if (selection.length > 1) {
                atom.notifications.addWarning(
                    `Selection must be 'reference': 'somePath' or simply 'somePath'`
                );

                return;
            }

            selection = _.first(selection);
        }

        selection = selection.replace(/\s*['"`]+\s*/g, '');

        let schema = this.getSchemaFromEditor();

        if (_.isEmpty(schema)) {
            atom.notifications.addWarning(
                `File must contain a schema to reference`
            );
            return;
        }
        var schemaReference = _.get(schema, selection);
        if (!schemaReference) {
            atom.notifications.addWarning(
                `Could not find schema item ${selection} in schema`
            );
            return;
        }

        //TODO: find schemaReference line number in file and set cursor positon
    },

    getSchemaFromEditor() {
        let editor = atom.workspace.getActiveTextEditor(),
            path = editor.getPath(),
            referenceFile;

        try {
            referenceFile = require(path);
        } catch (e) {
            atom.notifications.addWarning(e);
            return;
        }

        return _.get(referenceFile, 'schema');
    }
};
