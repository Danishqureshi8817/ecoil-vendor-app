import CustomText from '@/components/global/CustomText';
import {Fonts} from '@/constants/fonts';
import type {CollectionRequestRow} from '@/api/collectionApi';
import {
  collectionRequestLabel,
  collectionRequestStatus,
} from '@/api/collectionApi';
import {externalUi} from '@/styles/externalUi';
import React from 'react';
import {View} from 'react-native';

function formatDate(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const s = String(value);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return s;
}

type MetaItem = {label: string; value: string};

function buildMeta(row: CollectionRequestRow): MetaItem[] {
  const oilQty = row.oil_quantity ?? row.entered_volume ?? row.volume;
  const transQty = row.trans_quantity;
  const transStatus = row.trans_status;
  const drums = row.entered_drums_qty ?? row.drums_qty ?? row.drums;
  const emptyDrums = row.empty_drums_qty ?? row.empty_drums;
  const date = row.created_at ?? row.request_date ?? row.date ?? row.submitted_at;

  const items: MetaItem[] = [];
  if (oilQty != null) {
    items.push({label: 'Oil qty', value: String(oilQty)});
  }
  if (transQty != null) {
    items.push({label: 'Trans qty', value: String(transQty)});
  }
  if (transStatus != null) {
    items.push({label: 'Trans status', value: String(transStatus)});
  }
  if (drums != null) {
    items.push({label: 'Drums', value: String(drums)});
  }
  if (emptyDrums != null) {
    items.push({label: 'Empty drums', value: String(emptyDrums)});
  }
  if (date != null && date !== '') {
    items.push({label: 'Date', value: formatDate(date)});
  }
  return items;
}

type Props = {
  row: CollectionRequestRow;
};

export function CollectionRequestCard({row}: Props) {
  const meta = buildMeta(row);
  const notes = row.notes_for_team ?? row.notes;
  const notesStr = notes != null ? String(notes).trim() : '';

  return (
    <View style={externalUi.listCard}>
      <View style={externalUi.listCardHead}>
        <CustomText
          variant="h6"
          fontFamily={Fonts.inter.bold}
          style={externalUi.listCardTitle}
          numberOfLine={2}>
          {collectionRequestLabel(row)}
        </CustomText>
        <View style={externalUi.badge}>
          <CustomText variant="h7" style={externalUi.badgeText}>
            {collectionRequestStatus(row)}
          </CustomText>
        </View>
      </View>

      {meta.map(item => (
        <View key={item.label} style={externalUi.metaRow}>
          <CustomText variant="h7" style={externalUi.metaDt}>
            {item.label}
          </CustomText>
          <CustomText variant="h7" style={externalUi.metaDd}>
            {item.value}
          </CustomText>
        </View>
      ))}

      {notesStr ? (
        <CustomText variant="h7" style={externalUi.listNotes}>
          {notesStr}
        </CustomText>
      ) : null}
    </View>
  );
}
